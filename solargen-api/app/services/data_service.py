import pandas as pd
import os
import numpy as np

class DataService:
    def __init__(self):
        base_path = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        
        self.sites_path = os.path.join(base_path, "data", "Solar_Site_Details.csv")
        df = pd.read_csv(self.sites_path)
        df = df.replace({np.nan: None})

        mapping = {
            "CampusKey": "campusId",
            "SiteKey": "id",
            "kWp": "capacity",
            "Number of panels": "panelCount",
            "Panel": "panelType",
            "Inverter": "inverterType",
            "Optimizers": "optimizers",
            "Metric": "metric",
            "lat": "latitude",
            "Lon": "longitude"
        }

        self.df_sites = df.rename(columns=mapping)

        self.gen_path = os.path.join(base_path, "data", "Solar_Energy_Generation.csv")

    def get_all_sites(self):
        filtered_df = self.df_sites[self.df_sites['campusId'] == 1]
        
        if filtered_df.empty:
            return []
            
        return filtered_df.to_dict(orient="records")

data_service = DataService()