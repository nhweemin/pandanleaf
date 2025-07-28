curl -X POST https://homechef-production.up.railway.app/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "chefId": "CHEF_ID_HERE",
    "name": "Chocolate Peanut Butter Protein Bar",
    "description": "Rich chocolate and creamy peanut butter protein bar with 20g of high-quality whey protein. Perfect post-workout snack with no artificial preservatives.",
    "category": "Snacks",
    "cuisine": "Health Food",
    "images": ["https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop&crop=center"],
    "price": 4.50,
    "servings": 1,
    "cookTime": 0,
    "prepTime": 5,
    "difficulty": "Easy",
    "ingredients": ["Whey protein isolate", "Natural peanut butter", "Dark chocolate chips", "Oats", "Honey", "Coconut oil", "Sea salt"],
    "nutritionalInfo": {"calories": 220, "protein": 20, "carbs": 15, "fat": 8, "fiber": 4, "sugar": 8},
    "tags": ["High Protein", "Post-Workout", "Gluten-Free", "No Artificial Preservatives"],
    "dietary": ["Gluten-Free"],
    "spiceLevel": 0,
    "instructions": "Ready to eat. Store in cool, dry place.",
    "availability": {"isAvailable": true, "timeSlots": [], "leadTime": 1}
  }'"
