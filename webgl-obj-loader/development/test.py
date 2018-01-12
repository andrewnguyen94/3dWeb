import os
import sys


class Textures(object):
	def __init__(self, text_type, text_src):
		self.text_type = text_type
		self.text_src = text_src
		self.text_buff = []

	def setTextType(text_type):
		self.text_type = text_type

	def  setTextSrc(text_src):
		self.text_src = text_src

	def setTextBuff(text_buff):
		self.text_buff = text_buff

	def getTextType(self):
		return self.text_type

	def getTextSrc(self):
		return self.text_src

	def getTextBuff(self):
		return self.text_buff

class FaceT(object):
	face_t = []
	text_type = ""
	def __init__(self, text_type):
		self.text_type = text_type

	def setFaceT(face_t):
		self.face_t = face_t
	def getFaceT():
		return self.face_t
	def getTextType():
		return self.text_type

def getName(t):
	tmp = ""
	for i in range(len(t)):
		if i == 0:
			continue
		elif i < len(t) - 1:
			tmp = tmp + t[i] + " "
		else:
			tmp = tmp + t[i]
	return tmp

def getTextureFromName(name, text_classes):
	for i in range(len(text_classes)):
		print text_classes[i].getTextType(), name
		if text_classes[i].getTextType()[0] == name:
			return text_classes[i]

def main():
	vertexs = []
	normals = []
	textures = []
	text_classes = []
	text_buff = []
	face_t = []
	text_type = []
	text_src = []
	text_type_buff = []
	if sys.argv[1] != None:
		fp = sys.argv[1]
		fp1 = sys.argv[2]
	if fp1 != None:
		count = 0;
		f = open(fp1, 'r')
		lines = f.readlines()
		for ii in range(len(lines)):
			t = lines[ii].split()
			if t:
				if t[0] == 'map_Kd' or t[0] == 'map_bump':
					text_src.append(t[1])
					t_b = lines[ii - 5].split()
					tmp = getName(t_b)
					text_type.append(tmp)
					texture = Textures(text_type, text_src)
					text_classes.append(texture)
	if fp != None:
		f = open(fp, 'r')
		lines = f.readlines();
		e = None
		mtl = ""
		face_text = []
		for ii in range(len(lines)):
			t = lines[ii].split()
			if t:
				if t[0] == 'v':
					vertexs.append(t[1])
					vertexs.append(t[2])
					vertexs.append(t[3])
				if t[0] == 'vn':
					normals.append(t[1])
					normals.append(t[2])
					normals.append(t[3])
				if t[0] == 'vt':
					textures.append(t[1])
					textures.append(t[2])
				if t[0] == 'f':
					for i in range(3):
						w = t[i+1].split('/')
						face_t.append(w[2])
						face_text.append(w[2])
				if t[0] == 'usemtl':
					mtl = getName(t)
			else:
				t1 = lines[ii - 1].split()
				if t1:
					if t1[0] == 'f':
						e = getTextureFromName(mtl, text_classes)
						u = []
						if e.getTextBuff():
							u = e.getTextBuff()
						for j in range(len(face_text)):
							u.append(face_text[j])
						print u
						e.setTextBuff(u)
						mtl = ""
						face_text = []

	print text_classes
	for f in face_t:
		f1 = int(f)
		text_buff.append(textures[2 * f1 - 2])
		text_buff.append(textures[2 * f1 - 1])


if __name__ == '__main__':
	main()