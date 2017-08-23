import svgwrite

drw = svgwrite.Drawing('output.svg', size=('200px', '200px'))

drw.save()