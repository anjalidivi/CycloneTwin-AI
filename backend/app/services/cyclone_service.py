import os
from typing import List, Optional, Dict, Any
from app.schemas.cyclone import CycloneSummary, CycloneDetail, CycloneTrackResponse, BasinMetadata
from app.services.ibtracs_loader import ibtracs_loader

class CycloneService:
    def __init__(self):
        self._cyclones: List[CycloneDetail] = []
        self.reload()

    def reload(self):
        """Loads cached historical and simulated cyclones."""
        self._cyclones = ibtracs_loader.load_cached_cyclones()

    def get_all(
        self,
        search: Optional[str] = None,
        year: Optional[int] = None,
        basin: Optional[str] = None,
        origin: Optional[str] = None,
        min_wind: Optional[float] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[CycloneSummary]:
        filtered = self._cyclones

        if search:
            query = search.strip().upper()
            filtered = [
                c for c in filtered 
                if query in c.name.upper() 
                or query in c.id.upper() 
                or (c.sid and query in c.sid.upper())
            ]

        if year is not None:
            filtered = [c for c in filtered if c.year == year]

        if basin:
            b_norm = basin.strip().upper()
            filtered = [c for c in filtered if b_norm in c.basin.upper()]

        if origin:
            o_norm = origin.strip().upper()
            filtered = [c for c in filtered if o_norm in c.data_origin.upper()]

        if min_wind is not None:
            filtered = [c for c in filtered if c.max_wind_kmh >= min_wind]

        # Slice according to pagination
        paginated = filtered[offset : offset + limit]

        return [
            CycloneSummary(
                id=c.id,
                name=c.name,
                basin=c.basin,
                year=c.year,
                season=c.season,
                status=c.status,
                category=c.category,
                data_origin=c.data_origin,
                max_wind_kmh=c.max_wind_kmh,
                min_pressure_hpa=c.min_pressure_hpa,
                current_lat=c.current_lat,
                current_lon=c.current_lon,
                movement_dir=c.movement_dir,
                movement_speed_kmh=c.movement_speed_kmh,
                last_updated=c.last_updated,
                sid=c.sid,
                total_fixes=len(c.track)
            )
            for c in paginated
        ]

    def get_by_id(self, cyclone_id: str) -> Optional[CycloneDetail]:
        clean_id = cyclone_id.strip().upper()
        for c in self._cyclones:
            if c.id.upper() == clean_id or (c.sid and c.sid.upper() == clean_id):
                return c
        return None

    def get_track_for_cyclone(self, cyclone_id: str) -> Optional[CycloneTrackResponse]:
        c = self.get_by_id(cyclone_id)
        if not c:
            return None

        # Ensure ordered chronological fixes
        ordered_track = sorted(c.track, key=lambda p: p.timestamp)
        start_t = ordered_track[0].timestamp if ordered_track else c.last_updated
        end_t = ordered_track[-1].timestamp if ordered_track else c.last_updated

        return CycloneTrackResponse(
            cyclone_id=c.id,
            cyclone_name=c.name,
            sid=c.sid,
            data_origin=c.data_origin,
            total_fixes=len(ordered_track),
            start_time=start_t,
            end_time=end_t,
            track=ordered_track
        )

    def get_basins(self) -> List[BasinMetadata]:
        basin_counts: Dict[str, int] = {}
        for c in self._cyclones:
            basin_counts[c.basin] = basin_counts.get(c.basin, 0) + 1

        return [
            BasinMetadata(code=b[:3].upper(), name=b, cyclone_count=count)
            for b, count in sorted(basin_counts.items(), key=lambda x: x[1], reverse=True)
        ]

    def get_years(self) -> List[int]:
        years = sorted(list({c.year for c in self._cyclones}), reverse=True)
        return years

    def get_active_or_default(self) -> CycloneDetail:
        for c in self._cyclones:
            if "ASNA" in c.id.upper() or c.data_origin == "MODEL_SIMULATED":
                return c
        return self._cyclones[0] if self._cyclones else None

cyclone_service = CycloneService()
