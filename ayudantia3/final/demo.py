import svgwrite

drw = svgwrite.Drawing('output.svg', size=('200px', '200px'))

drw.add(drw.rect(insert=(48,48), size=(50,50), fill="red"))
drw.add(drw.rect(insert=(48,102), size=(50,50), fill="blue"))
drw.add(drw.rect(insert=(102,48), size=(50,50), fill="green"))
drw.add(drw.rect(insert=(102,102), size=(50,50), fill="yellow"))

drw.add(drw.circle(center=(100,100), r=95, fill="none", stroke_width=10, stroke="red"))
drw.add(drw.line(start=(200,0), end=(0,200), stroke="red", stroke_width=10))

drw.add(drw.text(text="No please", insert=(60,180)))
drw.add(drw.path(d="M180 180 L190 190 L200 180 L190 200 M170 180 L180 190 L190 180 L180 200 "))
drw.save()