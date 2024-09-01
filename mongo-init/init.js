db.createCollection(
    "config",
    {
        capped: true,
        size: 500000,
        max: 1,
    }
)

db.config.insertOne(
    {
        'refresh_interval': 60*5
    }
)
