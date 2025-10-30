export function calculateBMI(weight, height = 1.7) {
  return (weight / (height * height)).toFixed(2);
}

export function generateDietPlan(diagnosis, age, weight, lifestyle, allergies) {
  const dietPlans = {
    diabetes: {
      title: "Diabetic Diet Plan",
      guidelines: [
        "Limit carbohydrate intake to 45-60g per meal",
        "Choose complex carbohydrates over simple sugars",
        "Eat small, frequent meals throughout the day",
        "Include high-fiber foods",
        "Monitor blood glucose levels regularly"
      ],
      foods_to_eat: [
        "Whole grains (brown rice, oats, quinoa)",
        "Non-starchy vegetables (leafy greens, broccoli, peppers)",
        "Lean proteins (fish, chicken, tofu)",
        "Healthy fats (avocado, nuts, olive oil)",
        "Legumes and beans"
      ],
      foods_to_avoid: [
        "Sugary drinks and sodas",
        "White bread and refined grains",
        "Fried foods",
        "High-sugar desserts",
        "Processed snacks"
      ]
    },
    hypertension: {
      title: "DASH Diet for Hypertension",
      guidelines: [
        "Limit sodium intake to less than 2,300mg per day",
        "Increase potassium-rich foods",
        "Reduce saturated fat intake",
        "Maintain healthy weight",
        "Limit alcohol consumption"
      ],
      foods_to_eat: [
        "Fresh fruits and vegetables",
        "Whole grains",
        "Low-fat dairy products",
        "Lean meats and fish",
        "Nuts and seeds"
      ],
      foods_to_avoid: [
        "Salty processed foods",
        "Canned soups with added salt",
        "Fast food",
        "Pickled foods",
        "High-sodium condiments"
      ]
    },
    heart_disease: {
      title: "Heart-Healthy Diet",
      guidelines: [
        "Reduce saturated and trans fats",
        "Increase omega-3 fatty acids",
        "Eat plenty of fruits and vegetables",
        "Choose whole grains",
        "Limit cholesterol intake"
      ],
      foods_to_eat: [
        "Fatty fish (salmon, mackerel, sardines)",
        "Oats and barley",
        "Berries and citrus fruits",
        "Dark leafy greens",
        "Walnuts and almonds"
      ],
      foods_to_avoid: [
        "Red meat and processed meats",
        "Full-fat dairy products",
        "Fried foods",
        "Trans fats and margarine",
        "Excessive salt"
      ]
    },
    obesity: {
      title: "Weight Management Diet",
      guidelines: [
        "Create a calorie deficit of 500-750 calories per day",
        "Eat protein with every meal",
        "Fill half your plate with vegetables",
        "Practice portion control",
        "Stay hydrated with water"
      ],
      foods_to_eat: [
        "Lean proteins (chicken breast, fish, legumes)",
        "Non-starchy vegetables",
        "Whole fruits (not juice)",
        "Whole grains in moderation",
        "Healthy fats in small amounts"
      ],
      foods_to_avoid: [
        "Sugary beverages",
        "Fast food and fried items",
        "High-calorie snacks",
        "Refined carbohydrates",
        "Excessive alcohol"
      ]
    },
    kidney_disease: {
      title: "Renal Diet",
      guidelines: [
        "Limit protein intake as advised by doctor",
        "Control phosphorus and potassium levels",
        "Monitor fluid intake",
        "Limit sodium",
        "Regular monitoring of kidney function"
      ],
      foods_to_eat: [
        "Egg whites",
        "Low-potassium fruits (apples, berries)",
        "White rice and pasta",
        "Cauliflower and cabbage",
        "Lean meats in moderation"
      ],
      foods_to_avoid: [
        "High-potassium foods (bananas, oranges, tomatoes)",
        "Dairy products",
        "Whole grains",
        "Nuts and seeds",
        "Dark leafy greens"
      ]
    },
    other: {
      title: "General Healthy Diet",
      guidelines: [
        "Eat a balanced diet with variety",
        "Control portion sizes",
        "Stay hydrated",
        "Limit processed foods",
        "Consult with a healthcare provider"
      ],
      foods_to_eat: [
        "Variety of fruits and vegetables",
        "Whole grains",
        "Lean proteins",
        "Healthy fats",
        "Plenty of water"
      ],
      foods_to_avoid: [
        "Excessive sugar",
        "Highly processed foods",
        "Trans fats",
        "Excessive sodium",
        "Excessive alcohol"
      ]
    }
  };

  let plan = dietPlans[diagnosis] || dietPlans.other;

  const allergyNote = allergies ? `\n\nIMPORTANT: Patient has reported allergies to: ${allergies}. Please ensure these items are avoided in meal planning.` : '';

  const lifestyleCalories = {
    sedentary: 1800,
    lightly_active: 2000,
    moderately_active: 2200,
    very_active: 2500
  };

  const estimatedCalories = lifestyleCalories[lifestyle] || 2000;

  return {
    ...plan,
    estimated_daily_calories: estimatedCalories,
    allergy_note: allergyNote,
    generated_date: new Date().toISOString()
  };
}
