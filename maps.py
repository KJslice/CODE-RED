"""
utils/maps.py
─────────────────────────────────────────────────────────────────────────────
Google Maps API integration:
  - Nearby toilet search
  - Distance matrix (walking directions)
  - Reverse geocoding (lat/lng → address)
  - Static map URL generation (for public display boards)
  - Place details enrichment
"""

import os
import logging
from typing import Optional

import googlemaps
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

_gmaps_client: Optional[googlemaps.Client] = None


def get_gmaps() -> googlemaps.Client:
    global _gmaps_client
    if _gmaps_client is None:
        api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_MAPS_API_KEY not set in environment.")
        _gmaps_client = googlemaps.Client(key=api_key)
        logger.info("[Maps] Google Maps client initialized.")
    return _gmaps_client


# ── Nearby Search ────────────────────────────────────────────────────────────────

def find_nearby_toilets(lat: float, lng: float, radius_meters: int = 2000) -> list[dict]:
    """
    Search Google Places for public toilets near a coordinate.
    Returns enriched results with name, location, and place_id.
    """
    try:
        gmaps = get_gmaps()
        results = gmaps.places_nearby(
            location=(lat, lng),
            radius=radius_meters,
            keyword="public toilet washroom",
            type="point_of_interest",
        )
        places = []
        for p in results.get("results", [])[:10]:
            places.append({
                "place_id":   p["place_id"],
                "name":       p["name"],
                "lat":        p["geometry"]["location"]["lat"],
                "lng":        p["geometry"]["location"]["lng"],
                "rating":     p.get("rating"),
                "vicinity":   p.get("vicinity", ""),
                "open_now":   p.get("opening_hours", {}).get("open_now"),
            })
        return places
    except Exception as e:
        logger.error(f"[Maps] Nearby search failed: {e}")
        return []


# ── Distance Matrix ───────────────────────────────────────────────────────────────

def get_walking_distances(origin_lat: float, origin_lng: float,
                          destinations: list[dict]) -> list[dict]:
    """
    Calculate walking distance + ETA from origin to each toilet.

    destinations: list of { id, lat, lng }
    Returns:      list of { id, distance_m, duration_s, distance_text, duration_text }
    """
    try:
        if not destinations:
            return []

        gmaps  = get_gmaps()
        dest_coords = [(d["lat"], d["lng"]) for d in destinations]

        matrix = gmaps.distance_matrix(
            origins=[(origin_lat, origin_lng)],
            destinations=dest_coords,
            mode="walking",
            units="metric",
        )

        rows     = matrix.get("rows", [{}])
        elements = rows[0].get("elements", [])

        results = []
        for i, (dest, elem) in enumerate(zip(destinations, elements)):
            if elem.get("status") == "OK":
                results.append({
                    "id":            dest["id"],
                    "distance_m":    elem["distance"]["value"],
                    "duration_s":    elem["duration"]["value"],
                    "distance_text": elem["distance"]["text"],
                    "duration_text": elem["duration"]["text"],
                })
            else:
                results.append({
                    "id":            dest["id"],
                    "distance_m":    None,
                    "duration_s":    None,
                    "distance_text": "Unknown",
                    "duration_text": "Unknown",
                })
        return results

    except Exception as e:
        logger.error(f"[Maps] Distance matrix failed: {e}")
        return []


# ── Reverse Geocoding ─────────────────────────────────────────────────────────────

def reverse_geocode(lat: float, lng: float) -> dict:
    """
    Convert lat/lng to a human-readable address.
    Returns { address, area, city, postal_code }
    """
    try:
        gmaps   = get_gmaps()
        results = gmaps.reverse_geocode((lat, lng))
        if not results:
            return {}

        top = results[0]
        components = {c["types"][0]: c["long_name"] for c in top.get("address_components", [])}

        return {
            "address":     top.get("formatted_address", ""),
            "area":        components.get("sublocality_level_1", components.get("locality", "")),
            "city":        components.get("administrative_area_level_2", ""),
            "postal_code": components.get("postal_code", ""),
        }

    except Exception as e:
        logger.error(f"[Maps] Reverse geocode failed: {e}")
        return {}


# ── Static Map URL ────────────────────────────────────────────────────────────────

def get_static_map_url(toilets: list[dict], center_lat: float = 21.1458,
                       center_lng: float = 79.0882,
                       width: int = 800, height: int = 400) -> str:
    """
    Generate a Google Static Maps URL showing all toilet markers,
    color-coded by grade (A=green, B=yellow, C=orange, D=red).
    Used on public display boards.
    """
    api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    base    = "https://maps.googleapis.com/maps/api/staticmap"

    grade_colors = {"A": "green", "B": "yellow", "C": "orange", "D": "red"}
    marker_parts = []

    for t in toilets:
        color = grade_colors.get(t.get("grade", "D"), "gray")
        label = t.get("grade", "?")
        lat   = t.get("lat", 0)
        lng   = t.get("lng", 0)
        marker_parts.append(f"markers=color:{color}%7Clabel:{label}%7C{lat},{lng}")

    markers_str = "&".join(marker_parts)
    url = (
        f"{base}?center={center_lat},{center_lng}"
        f"&zoom=13&size={width}x{height}&maptype=roadmap"
        f"&{markers_str}&key={api_key}"
    )
    return url


# ── Place Details ─────────────────────────────────────────────────────────────────

def get_place_details(place_id: str) -> dict:
    """
    Fetch rich details for a Google Place (phone, website, hours, photos).
    """
    try:
        gmaps  = get_gmaps()
        result = gmaps.place(
            place_id=place_id,
            fields=["name", "formatted_address", "formatted_phone_number",
                    "opening_hours", "rating", "user_ratings_total", "photos"]
        )
        p = result.get("result", {})
        return {
            "name":    p.get("name"),
            "address": p.get("formatted_address"),
            "phone":   p.get("formatted_phone_number"),
            "rating":  p.get("rating"),
            "reviews": p.get("user_ratings_total"),
            "hours":   p.get("opening_hours", {}).get("weekday_text", []),
        }
    except Exception as e:
        logger.error(f"[Maps] Place details failed: {e}")
        return {}


# ── Directions (Deep Link) ────────────────────────────────────────────────────────

def get_directions_url(dest_lat: float, dest_lng: float,
                       origin_lat: Optional[float] = None,
                       origin_lng: Optional[float] = None) -> str:
    """Generate a Google Maps directions deep-link URL."""
    origin_param = f"{origin_lat},{origin_lng}" if origin_lat else ""
    return (
        f"https://www.google.com/maps/dir/{origin_param}/"
        f"{dest_lat},{dest_lng}/@{dest_lat},{dest_lng},16z/data=!3m1!4b1"
    )
