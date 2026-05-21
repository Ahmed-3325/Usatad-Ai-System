import json
import random

def generate_providers(num_providers=500):
    # 1. UI se exact match karti hui 6 Professions keys
    professions = ["AC Repair", "Plumber", "Electrician", "Painter", "Carpenter", "Home Clean"]
    
    # 2. Dynamic Pakistan Cities Matrix
    cities = ["Nawabshah", "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Hyderabad", "Sukkur"]
    
    first_names = ["Ali", "Ahmed", "Muhammad", "Usman", "Bilal", "Hassan", "Hussain", "Tariq", "Imran", "Kamran", "Faisal", "Nadeem", "Shahid", "Zahid", "Rashid", "Rizwan", "Sajid", "Waseem", "Zeeshan", "Shoaib", "Amir", "Asif", "Adnan", "Javed", "Kashif", "Zain", "Hamza", "Umer", "Mustafa"]
    last_names = ["Khan", "Shah", "Qureshi", "Malik", "Chaudhry", "Raja", "Sheikh", "Ansari", "Dar", "Butt", "Iqbal", "Bhatti", "Farooq", "Mahmood", "Janjua", "Awan", "Syed", "Baig", "Raza", "Abbasi", "Memon"]
    
    # 3. All 6 Categories Ke Liye Specialized Skillsets
    specializations = {
        "AC Repair": ["Split AC Installation", "Inverter AC Repair", "AC Servicing", "Gas Filling", "PCB Repair"],
        "Plumber": ["Pipe Leakage Fix", "Water Heater Repair", "Sanitary Fittings", "Drain Cleaning", "Water Motor Pump"],
        "Electrician": ["House Wiring", "UPS Installation", "Generator Repair", "Circuit Breaker Fix", "Ceiling Fan Repair"],
        "Painter": ["Interior Wall Paint", "Exterior Texture Paint", "Wood Polishing", "Wall Putty Application", "Wallpaper Installation"],
        "Carpenter": ["Door Lock Fitting", "Kitchen Cabinet Repair", "Sofa Repair & Cushioning", "Bed Assembly", "Wooden Wardrobe Design"],
        "Home Clean": ["Deep Home Cleaning", "Sofa & Carpet Wash", "Water Tank Cleaning", "Kitchen Degreasing", "Bathroom Sanitation"]
    }
    
    complexities = ["Basic", "Intermediate", "Complex"]
    statuses = ["Available", "Busy", "Offline"]
    
    providers = []
    for i in range(1, num_providers + 1):
        profession = random.choice(professions)
        city = random.choice(cities)
        
        # Determine distance and realistic travel time
        distance = round(random.uniform(0.5, 18.0), 1)
        travel_time = int(distance * random.uniform(1.5, 3.0))
        if travel_time < 5:
            travel_time = 5
            
        provider = {
            "Provider_ID": f"P-{i:03d}",
            "Name": f"{random.choice(first_names)} {random.choice(last_names)}",
            "Profession": profession,
            "City": city, # ✅ NEW CRITICAL FIELD INJECTED
            "Distance_km": distance,
            "Travel_Time_mins": travel_time,
            "Rating": round(random.uniform(3.0, 5.0), 1), # Better ratings for realistic demo
            "Review_Recency": random.randint(0, 90), 
            "Reliability_OnTime_Score": random.randint(70, 100), 
            "Skill_Specialization": random.choice(specializations[profession]),
            "Complexity_Handling": random.choice(complexities),
            "Base_Price_PKR": random.randint(10, 60) * 100, # 1000 to 6000 PKR
            "Cancellation_Risk": random.randint(0, 15), 
            "Availability_Status": random.choice(statuses)
        }
        providers.append(provider)
        
    return providers

if __name__ == "__main__":
    providers_data = generate_providers(500) # ✅ 500 People Configuration Set
    with open("providers.json", "w", encoding="utf-8") as f:
        json.dump(providers_data, f, indent=4, ensure_ascii=False)
    print("Successfully generated providers.json with 500 structured profiles across multiple cities!")