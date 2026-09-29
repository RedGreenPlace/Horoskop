# Erzeugt Referenzlängen (tropisch, scheinbar, geozentrisch) mit PyEphem (VSOP87/ELP) für 1000 Zufallszeitpunkte 1900-2100.
import ephem, json, random, math, datetime
random.seed(7)
names = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto']
out = []
for _ in range(1000):
    t = datetime.datetime(1900,1,1) + datetime.timedelta(minutes=random.randint(0, 200*365*1440))
    d = ephem.Date(t)
    row = {'t': t.strftime('%Y-%m-%dT%H:%M:00Z')}
    for n in names:
        b = getattr(ephem, n.capitalize())()
        b.compute(d, epoch=d)
        e = ephem.Ecliptic(ephem.Equatorial(b.a_ra, b.a_dec, epoch=d), epoch=d)
        row[n] = round(math.degrees(e.lon) % 360, 4)
    out.append(row)
json.dump(out, open('data/ephem_referenz.json','w'))
