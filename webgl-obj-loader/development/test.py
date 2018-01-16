import os
import sys
import json
import ast

class Textures(object):
	def __init__(self, text_type, text_src):
		self.text_type = text_type
		self.text_src = text_src
		self.text_buff = []

	def setTextType(self, text_type):
		self.text_type = text_type

	def  setTextSrc(self, text_src):
		self.text_src = text_src

	def setTextBuff(self, text_buff):
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
		if text_classes[i].getTextType() == name:
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
				if t[0] == 'map_Kd':
					text_src.append(t[1])
					t_b = lines[ii - 5].split()
					tmp = getName(t_b)
					text_type.append(tmp)
					texture = Textures(tmp, t[1])
					text_classes.append(texture)
	if fp != None:
		f = open(fp, 'r')
		lines = f.readlines();
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
						if e:
							if e.getTextBuff():
								u = e.getTextBuff()
							for j in range(len(face_text)):
								m = int(face_text[j])
								u.append(textures[2 * m - 2])
								u.append(textures[2 * m - 1])
							e.setTextBuff(u)
							mtl = ""
							face_text = []
	for f in face_t:
		f1 = int(f)
		text_buff.append(textures[2 * f1 - 2])
		text_buff.append(textures[2 * f1 - 1])
	datas = []
	if text_classes:
		for i in range(len(text_classes)):
			data = {
				'type' : text_classes[i].getTextType(),
				'src' : text_classes[i].getTextSrc(),
				'buff' : text_classes[i].getTextBuff(),
			}
			datas.append(data)
	with open('C:\\Users\\andrew_nguyen\\Downloads\\hihi\\data.json', 'w') as outfile:
		try:
			if datas:
				data = "data = ["
				for i in range(len(datas)):
					if i < len(datas) - 1:
						data += str(datas[i]) + ","
					else:
						data += str(datas[i]) + "];"
				jsons = json.dump(data, outfile)
		finally:
			outfile.close()

if __name__ == '__main__':
	main()