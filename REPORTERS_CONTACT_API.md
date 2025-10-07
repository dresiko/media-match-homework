# Reporters Contact API

API endpoints to retrieve contact information for reporters by name.

## Endpoints

### 1. Get Contact by Name (Query Parameter)

```http
GET /api/reporters/contact?name=Kalyeena Makortoff
```

**Response:**
```json
{
  "name": "Kalyeena Makortoff",
  "email": "kalyeena.makortoff@theguardian.com",
  "linkedin": "https://www.linkedin.com/in/kalyeena-makortoff",
  "twitter": "@kmakortoff"
}
```

### 2. Get Contact by Name (Path Parameter)

```http
GET /api/reporters/contact/jasper-jolly
```

**Response:**
```json
{
  "name": "Jasper Jolly",
  "email": "jasper.jolly@theguardian.com",
  "linkedin": "https://www.linkedin.com/in/jasperjolly",
  "twitter": "@jasperjolly"
}
```

### 3. Search Reporters

```http
GET /api/reporters/search?q=milmo
```

**Response:**
```json
{
  "query": "milmo",
  "results": [
    {
      "name": "Dan Milmo",
      "email": "dan.milmo@theguardian.com",
      "linkedin": "https://www.linkedin.com/in/danmilmo",
      "twitter": "@danmilmo"
    }
  ],
  "count": 1
}
```

### 4. Get All Reporters

```http
GET /api/reporters/all
```

**Response:**
```json
{
  "reporters": [
    {
      "name": "Nick Robins-Early",
      "email": "nick.robins-early@theguardian.com",
      "linkedin": "https://www.linkedin.com/in/nickrobinsearly",
      "twitter": "@nickrobinsearly"
    },
    // ... more reporters
  ],
  "count": 50
}
```

## Name Sanitization

Reporter names are automatically sanitized for lookup:
- Converted to lowercase
- Spaces replaced with hyphens
- Special characters removed (except hyphens)
- Apostrophes and quotes removed

**Examples:**
- `"Kalyeena Makortoff"` → `"kalyeena-makortoff"`
- `"Lisa O'Carroll"` → `"lisa-ocarroll"`
- `"Sarah Butler"` → `"sarah-butler"`

## Example Usage

### Using cURL

```bash
# Get contact by name
curl "http://localhost:3001/api/reporters/contact?name=Dan%20Milmo"

# Get contact with sanitized name
curl "http://localhost:3001/api/reporters/contact/dan-milmo"

# Search reporters
curl "http://localhost:3001/api/reporters/search?q=jolly"

# Get all reporters
curl "http://localhost:3001/api/reporters/all"
```

### Using JavaScript

```javascript
// Get contact by name
const response = await fetch('http://localhost:3001/api/reporters/contact?name=Jasper Jolly');
const contact = await response.json();
console.log(contact);

// Search reporters
const searchResponse = await fetch('http://localhost:3001/api/reporters/search?q=almeida');
const results = await searchResponse.json();
console.log(results);
```

## Supported Reporters

The API includes mock contact data for reporters from the three challenge briefs:

### Brief 1: Mortgage/Fintech
- Nick Robins-Early, Kalyeena Makortoff, Lauren Almeida, Paul MacInnes, Blake Montgomery, Sarah Butler, Jasper Jolly, Luca Ittimani, Rupert Jones, Dan Milmo, Jamie Grierson, Julia Kollewe, Edward Helmore, Joanna Partridge

### Brief 2: Restaurant Robotics
- Dara Kerr, Sammy Gecsoyler, Robert Booth, Alyx Gorman, Nick Huber, Alexander Abnos, Eleni Courea, Jillian Ambrose, Adam Morton, Emma Bryce, Amy Hawkins, Nils Pratley, Marina Dunbar, Eleanor Drage

### Brief 3: Materials/EV/Climate
- Dharna Noor, Jonathan Watts, Gina McCarthy, Lisa O'Carroll, Jessica Elgot, Oliver Milman, Rebecca Solnit, Rob Davies, Graeme Wearden, Tobi Thomas

**Total: 50 unique reporters** (updated to cover all three test case scenarios)

## Error Handling

### 404 Not Found
```json
{
  "error": "Reporter not found",
  "sanitizedName": "john-doe"
}
```

### 400 Bad Request
```json
{
  "error": "Reporter name is required as query parameter"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message details"
}
```
