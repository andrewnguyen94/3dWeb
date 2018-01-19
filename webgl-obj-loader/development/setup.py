import os
import sys
import json

class Mesh(object):
	"""docstring for ClassName"""
	def __init__(self, name):
		self.name = name
		self.text_diff = ""
		self.text_norm = ""
		self.vertices = []
		self.normals = []
		self.uvs = []
		self.diffuse = []
		self.ambient = []
		self.specular = []
		self.alpha = 1

	def get_name(self):
		return self.name

	def get_text_diff(self):
		return self.text_diff
	def set_text_diff(self, text_diff):
		self.text_diff = text_diff

	def get_text_norm(self):
		return self.text_norm
	def set_text_norm(self, text_norm):
		self.text_norm = text_norm

	def get_vertices(self):
		return self.vertices
	def set_vertices(self, vertices):
		self.vertices = vertices

	def get_normals(self):
		return self.normals
	def set_normals(self, normals):
		self.normals = normals

	def get_uvs(self):
		return self.uvs
	def set_uvs(self, uvs):
		self.uvs = uvs

	def get_diffuse(self):
		return self.diffuse
	def set_diffuse(self, diffuse):
		self.diffuse = diffuse

	def get_ambient(self):
		return self.ambient
	def set_ambient(self, ambient):
		self.ambient = ambient

	def get_specular(self):
		return self.specular
	def set_specular(self, specular):
		self.specular = specular

	def get_alpha(self):
		return self.alpha
	def set_alpha(self, alpha):
		self.alpha = alpha


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

def getAlpha(t):
	return t[1]

def getDiffuse(t):
	tmp = []
	for i in range(len(t)):
		if i == 0:
			continue
		else:
			tmp.append(t[i])
	return tmp

def getAmbient(t):
	tmp = []
	for i in range(len(t)):
		if i == 0:
			continue
		else:
			tmp.append(t[i])
	return tmp

def getSpecular(t):
	tmp = []
	for i in range(len(t)):
		if i == 0:
			continue
		else:
			tmp.append(t[i])
	return tmp

def getTextDiff(t):
	return t[1]

def getTextNorm(t):
	return t[1]

def getMeshFromName(name, MeshArray):
	for i in range(len(MeshArray)):
		if MeshArray[i].get_name() == name:
			return MeshArray[i]
def getVertices(t):
	tmp = []
	for i in range(len(t)):
		if i == 0:
			continue
		else:
			tmp.append(t[i])
	return tmp

def getNormals(t):
	tmp = []
	for i in range(len(t)):
		if i == 0:
			continue
		else:
			tmp.append(t[i])
	return tmp

def getUVs(t):
	tmp = []
	for i in range(len(t)):
		if i == 0:
			continue
		else:
			tmp.append(t[i])
	return tmp

def main():
	MeshArray = []
	fp = ""
	fp1 = ""
	if sys.argv[1] != None:
		fp = sys.argv[1]
	if sys.argv[2] != None:
		fp1 = sys.argv[2]

	if fp1 != None:
		f = open(fp1, 'r')
		lines = f.readlines()
		mesh = None
		for i in range(len(lines)):
			l = lines[i].split()
			if l:
				if l[0] == 'newmtl':
					name = getName(l)
					mesh = Mesh(name)
					MeshArray.append(mesh)
				if l[0] == 'Kd':
					diffuse = getDiffuse(l)
					mesh.set_diffuse(diffuse)
				if l[0] == 'Ka':
					ambient = getAmbient(l)
					mesh.set_ambient(ambient)
				if l[0] == 'Ks':
					specular = getSpecular(l)
					mesh.set_specular(specular)
				if l[0] == 'd':
					alpha = getAlpha(l)
					mesh.set_alpha(alpha)
				if l[0] == 'map_Kd':
					text_diff = getTextDiff(l)
					mesh.set_text_diff(text_diff)
				if l[0] == 'map_bump':
					text_norm = getTextNorm(l)
					mesh.set_text_norm(text_norm)
			else:
				mesh = None
	if fp != None:
		f = open(fp, 'r')
		lines = f.readlines()
		mesh = None
		vertices = []
		for i in range(len(lines)):
			l = lines[i].split()
			if l:
				if l[0] == 'usemtl':
					name = getName(l)
					mesh = getMeshFromName(name, MeshArray)
				if l[0] == 'v':
					vs = getVertices(l)
					for i in range(len(vs)):
						vertices.append(vs[i])
				if l[0] == 'vn':
					vns = getNormals(l)
					for i in range(len(vns)):
						normals.append(vns[i])
					l1 = lines[i-1].split()
					if l1[0] == 'v':
						mesh.set_vertices(vertices)
				if l[0] == 'vt':
					vts = getUVs(l)
					for i in range(len(vts)):
						uvs.append(vts[i])
					l1 = lines[i - 1].split()
					if l1[0] == 'vn':
						mesh.set_normals(normals)
				if l[0] == 'f':
					

			else:


if __name__ == '__main__':
	main()
