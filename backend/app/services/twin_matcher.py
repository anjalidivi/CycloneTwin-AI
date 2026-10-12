import math
from typing import List
from app.schemas.cyclone import CycloneDetail
from app.schemas.twins import HistoricalTwin, FeatureMatch, TwinMatchResult
from app.services.cyclone_service import cyclone_service

class TwinMatcherService:
    def match_twins(self, target: CycloneDetail) -> TwinMatchResult:
        all_cyclones = [c for c in cyclone_service._cyclones if c.id != target.id]
        twins: List[HistoricalTwin] = []

        target_dna = target.pattern_dna

        # Define impact summaries and casualties for benchmark comparison
        impact_map = {
            "AMPHAN-2020": {
                "impact": "Devastating coastal storm surge (4.5m) inundated the Sundarbans; severe inland squalls collapsed Kolkata power infrastructure.",
                "casualties": "128 fatalities across West Bengal, Odisha and Bangladesh. Approx $13.5B USD total damages."
            },
            "MOCHA-2023": {
                "impact": "Extreme eyewall landfall wiped out coastal IDP camps and telecommunications in Sittwe, Rakhine State, Myanmar.",
                "casualties": "Over 400 reported fatalities across Myanmar/Rakhine. Severe maritime fishing fleet loss."
            },
            "BIPARJOY-2023": {
                "impact": "Slow erratic track caused massive rainfall accumulation in Kutch, Gujarat and southwest Rajasthan.",
                "casualties": "Minimal loss of life (2 fatalities) credited to early evacuation of 100,000+ residents; major power line destruction."
            },
            "FANI-2019": {
                "impact": "Violent eyewall winds flattened electrical transmission in Puri and Bhubaneswar; extreme sea water inundation.",
                "casualties": "89 fatalities across India and Bangladesh. World-class evacuation model saved tens of thousands."
            },
            "TAUKTAE-2021": {
                "impact": "Severe offshore maritime disaster with barge sinking off Mumbai coast; massive destruction in Diu and Una orchards.",
                "casualties": "174 fatalities (including offshore personnel). Severe destruction to agricultural coconut and mango plantations."
            },
            "HAIYAN-2013": {
                "impact": "Tsunami-like storm surge (5-7m) obliterated coastal Tacloban and Samar provinces in central Philippines.",
                "casualties": "Over 6,300 verified deaths; 1,061 missing. One of the deadliest Pacific typhoons in modern history."
            },
            "KATRINA-2005": {
                "impact": "Catastrophic storm surge breached New Orleans levee network; submerged 80% of urban New Orleans.",
                "casualties": "1,392 fatalities along Gulf Coast. Over $190B in economic losses."
            }
        }

        for hist in all_cyclones:
            h_dna = hist.pattern_dna

            # Calculate dimensional similarities (0 to 100)
            def sim(val_target, val_hist, max_diff):
                diff = abs(val_target - val_hist)
                score = max(0.0, 1.0 - (diff / max_diff))
                return round(score * 100, 1)

            f_eye = FeatureMatch(
                feature_name="Eyewall Diameter",
                target_value=round(target_dna.eye_diameter_km, 1),
                twin_value=round(h_dna.eye_diameter_km, 1),
                unit="km",
                similarity_pct=sim(target_dna.eye_diameter_km, h_dna.eye_diameter_km, 40.0),
                importance_weight=0.15
            )

            f_asym = FeatureMatch(
                feature_name="Convective Asymmetry",
                target_value=round(target_dna.convective_asymmetry, 2),
                twin_value=round(h_dna.convective_asymmetry, 2),
                unit="index (0-1)",
                similarity_pct=sim(target_dna.convective_asymmetry, h_dna.convective_asymmetry, 0.5),
                importance_weight=0.15
            )

            f_band = FeatureMatch(
                feature_name="Spiral Banding Index",
                target_value=round(target_dna.spiral_banding_index, 2),
                twin_value=round(h_dna.spiral_banding_index, 2),
                unit="index (0-1)",
                similarity_pct=sim(target_dna.spiral_banding_index, h_dna.spiral_banding_index, 0.4),
                importance_weight=0.15
            )

            f_shear = FeatureMatch(
                feature_name="Ambient Vertical Shear",
                target_value=round(target_dna.vertical_wind_shear_kts, 1),
                twin_value=round(h_dna.vertical_wind_shear_kts, 1),
                unit="knots",
                similarity_pct=sim(target_dna.vertical_wind_shear_kts, h_dna.vertical_wind_shear_kts, 20.0),
                importance_weight=0.15
            )

            f_wind = FeatureMatch(
                feature_name="Peak Sustained Wind",
                target_value=round(target.max_wind_kmh, 1),
                twin_value=round(hist.max_wind_kmh, 1),
                unit="km/h",
                similarity_pct=sim(target.max_wind_kmh, hist.max_wind_kmh, 150.0),
                importance_weight=0.20
            )

            f_press = FeatureMatch(
                feature_name="Minimum Pressure",
                target_value=round(target.min_pressure_hpa, 1),
                twin_value=round(hist.min_pressure_hpa, 1),
                unit="hPa",
                similarity_pct=sim(target.min_pressure_hpa, hist.min_pressure_hpa, 80.0),
                importance_weight=0.20
            )

            feature_matches = [f_eye, f_asym, f_band, f_shear, f_wind, f_press]

            # Structural subscore
            structural_sim = (f_eye.similarity_pct + f_asym.similarity_pct + f_band.similarity_pct) / 3.0
            # Intensity subscore
            intensity_sim = (f_wind.similarity_pct + f_press.similarity_pct) / 2.0
            
            # Track / Basin geographic compatibility
            same_basin = 1.0 if target.basin.split()[0] in hist.basin else 0.75
            track_sim = round(min(100.0, ((structural_sim * 0.4) + (intensity_sim * 0.4) + 20) * same_basin), 1)

            # Overall weighted similarity
            total_weight = sum(f.importance_weight for f in feature_matches)
            weighted_score = sum(f.similarity_pct * f.importance_weight for f in feature_matches) / total_weight
            
            # Slightly modulate by basin relevance
            overall_sim = round((weighted_score * 0.85) + (track_sim * 0.15), 1)

            info = impact_map.get(hist.id, {
                "impact": f"Significant meteorological event in {hist.basin} during {hist.year}.",
                "casualties": "Impact metrics catalogued in NOAA IBTrACS archive."
            })

            twins.append(
                HistoricalTwin(
                    cyclone_id=hist.id,
                    name=hist.name,
                    year=hist.year,
                    basin=hist.basin,
                    peak_category=hist.category,
                    overall_similarity_pct=overall_sim,
                    track_similarity_pct=track_sim,
                    intensity_similarity_pct=round(intensity_sim, 1),
                    structural_similarity_pct=round(structural_sim, 1),
                    peak_wind_kmh=hist.max_wind_kmh,
                    min_pressure_hpa=hist.min_pressure_hpa,
                    landfall_impact_summary=info["impact"],
                    casualty_economic_impact=info["casualties"],
                    feature_matches=feature_matches,
                    track_points=hist.track,
                    is_sample_illustrative=False
                )
            )

        # Sort descending by overall similarity
        twins.sort(key=lambda x: x.overall_similarity_pct, reverse=True)

        return TwinMatchResult(
            target_cyclone_id=target.id,
            target_cyclone_name=target.name,
            twins=twins
        )

twin_matcher_service = TwinMatcherService()
