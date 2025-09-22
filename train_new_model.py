import pandas as pd
import openpyxl
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# --- 1. Load the Dataset ---
try:
    df = pd.read_excel('Crop_recommendation.xlsx')
    print("Dataset loaded successfully.")
except FileNotFoundError:
    print("Error: 'Crop_recommendation.xlsx' not found. Please make sure the file is in the same directory.")
    exit()

# --- 2. Define Features (X) and Target (y) ---
# These are the inputs for the model
features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
# This is what the model will predict
target = 'label'

X = df[features]
y = df[target]

print("Features and target defined.")
print(f"Feature columns: {features}")
print(f"Target column: {target}")


# --- 3. Split Data for Training and Testing ---
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print("Data split into training and testing sets.")

# --- 4. Train the Random Forest Model ---
print("Training the Random Forest model...")
model = RandomForestClassifier(n_estimators=120, random_state=42)
model.fit(X_train, y_train)
print("Model training complete.")

# --- 5. Evaluate the Model's Accuracy ---
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy on Test Data: {accuracy * 100:.2f}%")

# --- 6. Save the Trained Model ---
joblib.dump(model, 'crop_model_v2.joblib')
print("Model saved successfully as 'crop_model_v2.joblib'")