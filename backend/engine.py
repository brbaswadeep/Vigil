import math
from datetime import datetime
import asyncio

class Ewma:
    def __init__(self, alpha):
        self.alpha = alpha
        self.mean = None
        self.var = 0.0

    def update(self, x):
        if self.mean is None:
            self.mean = x
            return 0.0
        diff = x - self.mean
        self.mean += self.alpha * diff
        self.var = (1 - self.alpha) * (self.var + self.alpha * diff * diff)
        std = self.var ** 0.5
        return diff / std if std > 0 else 0.0

class Hit:
    def __init__(self, rule, evidence):
        self.rule = rule
        self.evidence = evidence

class StateStore:
    def __init__(self):
        self.deposits = {}

class RuleEngine:
    def __init__(self):
        self.weights = {
            "no_matching_deposit": 50,
            "token_mismatch": 30,
            "amount_mismatch": 30
        }

    def check_withdrawal(self, state, w):
        d = state.deposits.get(w['transfer_id'])
        if d is None:
            return [Hit("no_matching_deposit", [w['tx_hash']])]
        
        hits = []
        if d['token'] != w['token']:
            hits.append(Hit("token_mismatch", [w['tx_hash'], d['tx_hash']]))
        if d['amount'] != w['amount']:
            hits.append(Hit("amount_mismatch", [w['tx_hash'], d['tx_hash']]))
        return hits

class Scorer:
    def __init__(self):
        self.stat_weight = 10
        self.stat_cap = 5

    def score(self, rule_hits, stat_signal, rule_weights):
        s = sum(rule_weights.get(h.rule, 0) for h in rule_hits)
        s += self.stat_weight * min(stat_signal, self.stat_cap)
        return min(100, round(s))

    def get_level(self, score):
        if score <= 30: return "low"
        if score <= 70: return "medium"
        return "critical"

class ReplayEngine:
    def __init__(self, events):
        self.events = sorted(events, key=lambda e: e['ts'])
        self.state = StateStore()
        self.rule_engine = RuleEngine()
        self.ewma = Ewma(0.1)
        self.scorer = Scorer()
        
        self.current_index = 0
        self.is_playing = False
        self.speed = 1.0
        self.clock_ts = None
        if self.events:
            self.clock_ts = datetime.fromisoformat(self.events[0]['ts'].replace('Z', '+00:00')).timestamp()
            
        self.outflow_per_minute = {}
        self.alert_counter = 0

    def process_event(self, event):
        ts_minute = event['ts'][:16]
        
        if event['kind'] == 'deposit':
            self.state.deposits[event['transfer_id']] = event
            event['status'] = 'pending'
            return None
            
        elif event['kind'] == 'withdraw':
            self.outflow_per_minute[ts_minute] = self.outflow_per_minute.get(ts_minute, 0) + event['usd_value']
            
            # Simple rule logic
            hits = self.rule_engine.check_withdrawal(self.state, event)
            
            if not hits:
                event['status'] = 'matched'
                return None
            
            event['status'] = 'unmatched'
            
            # Stat signal
            stat_signal = self.ewma.update(self.outflow_per_minute[ts_minute])
            
            # Score
            score = self.scorer.score(hits, stat_signal, self.rule_engine.weights)
            level = self.scorer.get_level(score)
            
            if score > 0:
                self.alert_counter += 1
                return {
                    "alert_id": f"ALT-{self.alert_counter}",
                    "bridge": event['bridge'],
                    "raised_at": event['ts'],
                    "first_event_at": event['ts'],
                    "score": score,
                    "level": level,
                    "exploit_type": "Unauthorized Withdrawal",
                    "reason": "A withdrawal on the destination chain has no matching deposit on the source chain.",
                    "rule_hits": [{"rule": h.rule, "weight": self.rule_engine.weights.get(h.rule, 0), "evidence": h.evidence} for h in hits],
                    "stat_signal": {"name": "Outflow EWMA", "value": round(stat_signal, 2), "weight": self.scorer.stat_weight},
                    "suggested_actions": ["Pause withdrawals on destination", "Investigate bridge replica"]
                }
        return None
