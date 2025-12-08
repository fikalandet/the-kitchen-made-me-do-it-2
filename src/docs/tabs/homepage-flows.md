# Startsida – Datakopplingar & flödeslogik

## 🧩 Flöden och datakällor

| Sektion | Tabell | Villkor / sortering |
|----------|--------|--------------------|
| På spisen nu | `dishes` + `chef_schedule` | `cook_date == selectedDate` |
| Populärt käk | `dishes` + `orders` | sort by `sales_count DESC` |
| Nytt på menyn | `dishes` | `created_at > now() - 30 days` |
| Kylskåpsmeny | `meal_boxes`, `kits`, `subscriptions` | `is_visible = true` |
| Veckans kockar | `chefs` | featured = true |
| Schyssta deals | `promotions` | `ends_at > now()` |
| Tävlingar | `contests` | `deadline_at > now()` |
| Testkäka & Tyck till | `dishes` | `feedback_active = true` |
| Önska käk | `wishes` | `status = 'open'` |
| Evenemang | `events` + `event_bookings` | `start_time > now()` |
| Tjuvkik i köket | `reels` | senaste 10 |
| Kock i fokus | `chefs` | `featured = true` |
| Humörkäk | `dishes` | `mood_tag != null` |
| Hälsokäk | `articles` | `category = 'health'` |
| En sked för mamma | `articles` | `category = 'charity'` |
| Horoskop | `horoscopes` | alla 12 tecken |
| Smaketiketter | `dishes` | `taste_tag != null` |

## 💾 Backendkoppling
- `supabase` för dataladdning
- Filter via URL-parametrar (geo/date)
- Fallback = placeholderkort

## 📊 Auto-hide
- Dölj sektioner utan data
