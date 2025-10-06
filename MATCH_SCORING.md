# Reporter Match Scoring Algorithm

## Overview

The match score reflects how well a reporter's coverage aligns with your story. The algorithm rewards both **quality** (best match) and **consistency** (multiple relevant articles).

## Scoring Formula

```
baseScore = (1 - bestArticle.distance) × 100
bonus = sum of (10% of each additional article's score)
finalScore = min(100, baseScore + bonus)
```

### How It Works

**1. Start with the best article**
- The reporter's best matching article becomes the base score
- Example: Best article has distance 0.45 → Base score = 55

**2. Add bonuses from other articles**
- Each additional article contributes **10% of its score** as a bonus
- Example: Second article scores 45 → Bonus = 4.5

**3. Cap at 100**
- Final score cannot exceed 100 (perfect match)

This simple approach rewards quality first, then adds meaningful bonuses for multiple relevant articles.

## Examples

### Example 1: Your Case - Two Articles (55 and 45)

**Reporter with 2 articles:**
- Article 1 (best): distance = 0.45 → score = 55
- Article 2: distance = 0.55 → score = 45

```
Base score = 55 (from best article)
Bonus = 45 × 0.10 = 4.5
Final score = 55 + 4.5 = 59.5 ≈ 60
```

**Final score: 60** ✨

### Example 2: One-Hit Wonder vs. Consistent Reporter

**Reporter A: Single Great Match**
- 1 article, score = 90
- Base = 90
- Bonus = 0 (no additional articles)
- **Final score: 90**

**Reporter B: Consistent Coverage**
- 5 articles, scores = [88, 85, 82, 78, 75]
- Base = 88
- Bonus = (85 + 82 + 78 + 75) × 0.10 = 32
- **Final score: 88 + 32 = 120 → capped at 100** ✨

### Example 3: Deep Expert

**Reporter C: Many Relevant Articles**
- 8 articles, scores = [92, 88, 85, 82, 80, 78, 75, 72]
- Base = 92
- Bonus = (88 + 85 + 82 + 80 + 78 + 75 + 72) × 0.10 = 56
- **Final score: 92 + 56 = 148 → capped at 100** ✨

A true expert hits the cap!

### Example 4: Quality Beats Quantity

**Reporter D: Many Mediocre Articles**
- 6 articles, scores = [50, 48, 45, 42, 40, 38]
- Base = 50
- Bonus = (48 + 45 + 42 + 40 + 38) × 0.10 = 21.3
- **Final score: 50 + 21.3 = 71**

**Reporter E: Fewer, Better Articles**
- 2 articles, scores = [85, 82]
- Base = 85
- Bonus = 82 × 0.10 = 8.2
- **Final score: 85 + 8.2 = 93** ✨

Quality still wins!

## Why This Approach?

### Simple & Intuitive
- **Best article = foundation**: Your best work defines your baseline
- **10% bonus per article**: Each additional article adds meaningful value
- **Capped at 100**: Prevents inflation, maintains score integrity

### Benefits
- **Easy to understand**: "Best score + 10% from others"
- **Rewards expertise**: Multiple articles = higher score
- **Quality first**: Base score matters most
- **Fair bonuses**: 10% is meaningful but not overwhelming

### Alternative Approaches Considered

#### ❌ Simple Average
```javascript
avgDistance = allArticles.reduce((sum, a) => sum + a.distance, 0) / allArticles.length;
```
**Problem**: Dilutes the signal. One perfect article + 9 mediocre = mediocre score.

#### ❌ Best Article Only
```javascript
score = 1 - bestArticle.distance;
```
**Problem**: Ignores consistency. One-hit wonders rank same as deep experts.

#### ❌ Exponential Boost
```javascript
volumeBoost = 1 - Math.exp(-articleCount * 0.1);
```
**Problem**: Too aggressive. Article count dominates over match quality.

#### ✅ Our Approach: Hybrid
Balances quality (60% best match) with consistency (40% avg) plus modest volume boost.

## Tuning Parameters

You can adjust the bonus percentage in `calculateReporterScore()`:

```javascript
const BONUS_PERCENTAGE = 0.10;  // 10% of each additional article's score
```

**Different bonus levels:**
- **5%**: Very conservative, small bonuses
- **10%**: Balanced (current) ⭐
- **15%**: Generous, rewards volume well
- **20%**: Very generous, experts hit cap quickly

## Implementation

Located in `/api/src/routes/reporters.js`:

```javascript
function calculateReporterScore(reporter) {
  if (reporter.relevantArticles.length === 0) {
    return { finalDistance: 1.0, matchScore: 0 };
  }

  // Sort by best match first
  const sortedArticles = reporter.relevantArticles.sort((a, b) => a.distance - b.distance);
  
  // Best article = base score
  const bestDistance = sortedArticles[0].distance;
  const baseScore = (1 - bestDistance) * 100;

  // Single article - no bonus
  if (sortedArticles.length === 1) {
    return {
      finalDistance: bestDistance,
      matchScore: Math.round(baseScore)
    };
  }

  // Additional articles contribute 10% of their score
  let bonus = 0;
  const BONUS_PERCENTAGE = 0.10;
  
  for (let i = 1; i < sortedArticles.length; i++) {
    const articleScore = (1 - sortedArticles[i].distance) * 100;
    bonus += articleScore * BONUS_PERCENTAGE;
  }

  // Cap at 100
  const finalScore = Math.min(100, Math.round(baseScore + bonus));
  const finalDistance = 1 - (finalScore / 100);

  return {
    finalDistance,
    matchScore: finalScore
  };
}
```

## Testing

### Compare Rankings

Run a search and examine the reporters:
```javascript
{
  "rank": 1,
  "name": "Dan Milmo",
  "matchScore": 92,
  "totalRelevantArticles": 8
}
```

A reporter with 8 articles and score 92 might now rank **higher** than one with 2 articles and score 90, even though the latter has a better single match.

### Verification

Check the console logs to see the scoring breakdown:
```javascript
console.log('Reporter:', reporter.name);
console.log('Best distance:', bestDistance);
console.log('Avg top 3:', avgTopDistance);
console.log('Base score:', baseScore);
console.log('Volume boost:', volumeBoost);
console.log('Final score:', matchScore);
```

## Future Enhancements

1. **Recency weighting**: Recent articles worth more than old ones
2. **Outlet prestige**: Boost for tier-1 publications
3. **Article depth**: Longer, more detailed articles score higher
4. **User feedback**: Learn from user selections to refine weights
5. **A/B testing**: Try different formulas and measure user satisfaction

## Related Files

- `/api/src/routes/reporters.js` - Scoring implementation
- `/REPORTER_MATCHING_FLOW.md` - Overall matching flow
- `/README.md` - API documentation

