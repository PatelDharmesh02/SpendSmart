CATEGORIES = [
    "groceries", "rent", "food", "travel", "salary",
    "utilities", "entertainment", "subscriptions", "shopping", "health", "miscellaneous"
]

# Priority order for category matching (most specific first)
CATEGORY_RULES = [
    # Salary (high priority, specific keywords)
    {
        "category": "salary",
        "keywords": ["salary", "payroll", "stipend", "income", "wage", "paycheck",
            "earnings", "compensation", "remuneration", "monthly salary", "annual salary"
            "pension", "bonus", "commission", "gratuity", "allowance", "salary slip",
            "salary transfer", "salary deposit", "salary credit", "salary payment"
        ],
        "amount_min": 10000  # Minimum expected salary amount
    },
    
    # Rent (high amount, specific keywords)
    {
        "category": "rent",
        "keywords": ["rent", "lease", "room rent", "house rent", "apartment rent", "tenant"
            "landlord", "rental", "rent payment", "rent transfer", "rent deposit",
            "rent due", "rent bill", "rent receipt", "rent agreement", "rent contract"
        ],
        "amount_min": 5000,
        "priority": 1
    },
    
    # Subscriptions (specific service names)
    {
        "category": "subscriptions",
        "keywords": [
            "netflix", "spotify", "prime", "amazon prime", "subscription", "membership",
            "streaming", "youtube premium", "app store", "play store", "software", "renewal",
            "subscription fee", "monthly subscription", "annual subscription", "digital service",
            "online service", "cloud service", "saas", "streaming service", "media subscription",
        ]
    },
    
    # Utilities (bill-related keywords)
    {
        "category": "utilities",
        "keywords": [
            "electricity", "water", "gas", "internet", "phone", "mobile", "bill", "wifi",
            "telephone", "landline", "cable", "broadband", "utility", "trash", "sewer", 
            "broadband", "cable", "utility", "trash", "sewer", "bsnl", "jio", "airtel",
            "vodafone", "reliance", "paytm", "phonepe", "google pay", "upi", "bill payment",
            "utilities", "telecom", "dth", "landline", "mobile recharge", "recharge"
        ]
    },
    
    # Health (medical keywords)
    {
        "category": "health",
        "keywords": [
            "hospital", "clinic", "pharmacy", "med", "drug", "doctor", "dentist",
            "health", "medical", "insurance", "chemist", "apollo", "pharma", "lab",
            "healthcare", "wellness", "treatment", "checkup", "consultation", "medicine",
            "health insurance", "medical insurance", "doctor's fee", "health checkup"
        ]
    },
    
    # Travel (transportation keywords with amount thresholds)
    {
        "category": "travel",
        "keywords": [
            "flight", "airlines", "hotel", "taxi", "uber", "ola", "train", "bus", "fuel",
            "petrol", "diesel", "gas station", "airport", "trip", "voyage", "travel", "metro",
            "cab", "ride", "journey", "commute", "transportation", "car rental", "bus ticket",
            "train ticket", "flight ticket", "travel agency", "tour", "holiday", "vacation"
        ],
        "amount_max": 100000  # Maximum expected travel amount
    },
    
    # Groceries (food items and stores)
    {
        "category": "groceries",
        "keywords": [
            "grocery", "supermarket", "mart", "dairy", "vegetable", "fruit", "meat",
            "fish", "bakery", "provision", "bigbasket", "grofers", "dmart", "spencers",
            "more", "reliance fresh", "food world", "kirana", "ration", "groceries",
            "wholesale", "retail", "local market", "vegetable market", "fruit market",
            "grocery store", "superstore", "convenience store", "organic store", "health food"
        ]
    },
    
    # Food (dining keywords)
    {
        "category": "food",
        "keywords": [
            "restaurant", "cafe", "coffee", "cafeteria", "diner", "dining", "eat",
            "food court", "fast food", "pizza", "burger", "mcd", "kfc", "domino",
            "starbucks", "bar", "pub", "bistro", "eatery", "chai", "tea", "lunch",
            "dinner", "breakfast", "zomato", "swiggy", "eatsure", "food",
            "meal", "takeaway", "delivery", "snack", "cuisine", "buffet", "food truck",
            "food delivery", "food order", "restaurant bill", "dining out", "food expenses"
        ]
    },
    
    # Entertainment (leisure activities)
    {
        "category": "entertainment",
        "keywords": [
            "movie", "cinema", "theater", "concert", "game", "ticket", "amusement",
            "zoo", "museum", "gallery", "arcade", "bowling", "golf", "sports", "fun",
            "entertainment", "event", "show", "performance", "comedy", "drama", "music",
            "festival", "carnival", "circus", "theme park", "water park", "nightclub",
            "pub", "bar", "nightlife", "entertainment center", "live show", "stand-up"
        ]
    },
    
    # Shopping (retail keywords)
    {
        "category": "shopping",
        "keywords": [
            "clothes", "clothing", "shoes", "footwear", "electronics", "amazon",
            "flipkart", "shop", "store", "mall", "market", "bazaar", "jewelry",
            "watch", "furniture", "decor", "apparel", "accessories", "myntra", "ajio",
            "shopping", "retail", "boutique", "outlet", "brand", "fashion", "style",
            "cosmetics", "makeup", "beauty", "gifts", "toys", "gadgets", "appliances",
        ]
    }
]
