# Vigil XGBoost Security Model - Backend Integration Guide

## 1. Overview
Trained XGBoost Classifier to detect real-time cross-chain bridge exploits.

## 2. Model Input Specifications (5 Features)
Pass a 2D numpy array or DataFrame with features in this exact order:
1. `log_usd` (float): np.log1p(event['usd_value'])
2. `roll_cnt_5m` (int): Count of bridge withdrawals in past 5 minutes
3. `roll_usd_5m` (float): np.log1p(sum of usd in past 5 minutes)
4. `ewma_z` (float): (current_outflow - ewma_mean) / (ewma_std + 1e-6)
5. `new_recipient` (int): 1 if destination wallet address is unseen, else 0

## 3. Model Output Specifications
- `raw_probability`: float between 0.0 and 1.0 (from predict_proba[:, 1])
- `ml_risk_score`: round(raw_probability * 100, 1) (0 to 100 scale)
- `ml_level`: 'low' (< 25), 'medium' (25 - 50), 'critical' (> 50)

## 4. Backend Python Code for engine.py
```python
import numpy as np
import xgboost as xgb

class VigilMLScorer:
    def __init__(self, model_file='xgb_model.json'):
        self.model = xgb.XGBClassifier()
        self.model.load_model(model_file)

    def predict(self, log_usd, roll_cnt_5m, roll_usd_5m, ewma_z, new_recipient):
        feats = np.array([[log_usd, roll_cnt_5m, roll_usd_5m, ewma_z, new_recipient]])
        prob = float(self.model.predict_proba(feats)[0, 1])
        score = round(prob * 100, 1)
        level = 'critical' if score >= 50 else ('medium' if score >= 25 else 'low')
        return {'ml_risk_score': score, 'ml_probability': round(prob, 4), 'ml_level': level}
```

## 5. Included Files
- `xgb_model.json`: Trained model weights
- `scorecard.json`: Evaluation benchmark results (for frontend Scorecard tab)
- `model_card.json`: Evaluation metadata
- `README.md`: This file