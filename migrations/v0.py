# DOC
#
# To migrate slot listeners from hardcoded to database

print("Migration start")

from pymongo import MongoClient

auth_data = {
    'gbLON2fr': {
        'username': 'jeepeo55@gmail.com',  # FRA1LON*
        'password': 'Test@123',
        'fg_id': 17138877,
        'country': 'fr'
    },
    'gbLON2fr-1': {
        'username': 'niniv69394@cetnob.com',
        'password': 'Test@123',
        'fg_id': 16902753,
        'country': 'fr'
    },
    'gbLON2fr-2': {
        'username': 'tidele4204@ofionk.com',
        'password': 'Test@123',
        'fg_id': 16898654,
        'country': 'fr'
    },
    'gbLON2fr-3': {
        'username': 'peleba6455@cetnob.com',
        'password': 'Test@123',
        'fg_id': 16892730,
        'country': 'fr'
    },
    'gbMNC2fr': {
        'username': 'podogo5601@skrak.com',  # FRA1MC*<total:17>
        'password': 'Test@123',
        'fg_id': 16969495,
        'country': 'fr',
    },
    'gbMNC2fr-1': {
        'username': 'kotate5955@sgatra.com',
        'password': 'Test@123',
        'fg_id': 16969694,
        'country': 'fr',
    },
    'gbEDI2fr': {
        'username': 'rotonot518@rinseart.com',  # FRA1ED*<total:17>
        'password': 'Test@123',
        'fg_id': 16969751,
        'country': 'fr',
    },
    'gbEDI2fr-1': {
        'username': 'lekepe5839@rinseart.com',
        'password': 'Test@123',
        'fg_id': 16969897,
        'country': 'fr',
    },
    'gbLON2de': {
        'username': 'podogo5601@skrak.com',
        'password': 'Test@123',
        'fg_id': 2706974,
        'country': 'de',
    },
    'gbMNC2de': {
        'username': 'aspint.de.mnc@proton.me',
        'password': 'Test@123',
        'fg_id': 2709695,
        'country': 'de'
    },
    'gbEDI2de': {
        'username': 'aspint.de.edi@proton.me',
        'password': 'Test@123',
        'fg_id': 2692471,
        'country': 'de',
    },
    'gbLON2be': {
        'username': 'sopadam438@ploncy.com',
        'password': 'Test@123',
        'fg_id': 1205589,
        'country': 'be'
    },
    'gbMNC2be': {
        'username': 'aspint.be.mnc@proton.me',
        'password': 'Test@123',
        'fg_id': 1205594,
        'country': 'be',
    },

    # 1/3/25
    'gbEDI2be': {
        'username': 'aspint.be.edi@proton.me',
        'password': 'Test@123',
        'fg_id': 1208547,
        'country': 'be'
    },

    # 1/3/25
    'gbLON2ch': {
        'username': 'nogaf50833@hapied.com',
        'password': 'Test@123',
        'fg_id': 1205484,
        'country': 'ch',
    },
    # 1/3/25
    'gbEDI2ch': {
        'username': 'nogaf50833@hapied.com',
        'password': 'Test@123',
        'fg_id': 1202124,
        'country': 'ch',
    },
    'gbMNC2ch': {
        'username': 'nogaf50833@hapied.com',
        'password': 'Test@123',
        'fg_id': 1202133,
        'country': 'ch',
    },
}


rotate1 = {
    'gbMNC2ch': {
        'username': 'virora9720@skrak.com',
        'password': 'Test@123',
        'fg_id': 1206000,
        'country': 'ch',
    },
    'gbLON2ch': {
        'username': 'virora9720@skrak.com',
        'password': 'Test@123',
        'fg_id': 1206005,
        'country': 'ch',
    },
    'gbLON2be': {
        'username': "aspint.be.edi@proton.me",
        'password': 'Test@123',
        'fg_id': 1208574,
        'country': 'be',
    },
    'gbMNC2be': {
        'username': 'meroma2662@skrak.com',
        'password': 'Test@123',
        'fg_id': 1208578,
        'country': 'ch'
    },
    'gbLON2de': {
        'username': 'bofifo7117@skrak.com',
        'password': 'Test@123',
        'fg_id': 2709692,
        'country': 'de',
    },
    'gbMNC2de': {
        'username': 'xobov27499@aiworldx.com',
        'password': 'Test@123',
        'fg_id': 2709975,
        'country': 'de',
    }
}

rotate2 = {
    'gbLON2de': {
        'username': 'tafegaj923@exweme.com',
        'password': 'Test@123',
        'fg_id': 2709923,
        'country': 'de'
    },

}


client = MongoClient("mongodb://user:psw@127.0.0.1:27017/?directConnection=true")
col = client["aspint"]["slot_listeners"]
entries = [
    {
        "rotate_id": 0,
        "cdata": {},
    },
    {
        "rotate_id": 1,
        "cdata": {},
    },
    {
        "rotate_id": 2,
        "cdata": {},
    },
]

for idx, ad in enumerate([auth_data, rotate1, rotate2]):
    for center in ad:
        def clean(_c: str):
            if "-" in _c:
                return _c.split('-')[0]
            return _c

        if clean(center) in entries[idx]['cdata']:
            entries[idx]['cdata'][clean(center)].append(ad[center])
        else:
            entries[idx]['cdata'][clean(center)] = [ad[center]]

col.insert_many(entries)
print("Migration Finished")
