import os
import sys
import json

class  Vectors3D(object):
	"""docstring for  Vectors"""
	def __init__(self, x,y,z):
		self.x = x
		self.y = y
		self.z = z

	def get_x(self):
		return self.x

	def get_y(self):
		return self.y

	def get_z(self):
		return self.z

class Vectors2D(object):
	"""docstring for Vectors2D"""
	def __init__(self, x,y):
		self.x = x
		self.y = y

	def get_x(self):
		return self.x

	def get_y(self):
		return self.y

	def get_z(self):
		return self.z
		

def subVector3D(a, b):
	a_x = a.get_x()
	a_y = a.get_y()
	a_z = a.get_z()

	b_x = b.get_x()
	b_y = b.get_y()
	b_z = b.get_z()

	c_x = b_x - a_x
	c_y = b_y - a_y
	c_z = b_z - a_z

	return Vectors3D(c_x, c_y, c_z)

def sub2Vector3D(a, b):
	return Vectors3D(a.get_x() - b.get_x(), a.get_y() - b.get_y(), a.get_z() - b.get_z())

def subVector2D(a,b):
	a_x = a.get_x()
	a_y = a.get_y()

	b_x = b.get_x()
	b_y = b.get_y()

	c_x = b_x - a_x
	c_y = b_y - a_y

	return Vectors2D(c_x, c_y)

def mulVector3DWithConst(a, b):
	b_x = b.get_x()
	b_y = b.get_y()
	b_z = b.get_z()

	return Vectors3D(a * b_x, a * b_y, a * b_z)

def mulVector2DWithConst(a, b):
	b_x = b.get_x()
	b_y = b.get_y()

	return Vectors2D(a * b_x, a * b_y)

def new_range(start, end, step):
    while start <= end:
        yield start
        start += step
		
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
		self.verts_buff = []
		self.norms_buff = []
		self.uvs_buff = []
		self.isBump = 0
		self.tangents = []
		self.bit_tangents = []
		self.verts = 0;

	def set_verts(self, verts):
		self.verts = verts
	def get_verts(self):
		return self.verts

	def set_tangents(self, tangents):
		self.tangents = tangents
	def get_tangents(self):
		return self.tangents

	def set_bit_tangents(self, bit_tangents):
		self.bit_tangents = bit_tangents
	def get_bit_tangents(self):
		return self.bit_tangents

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

	def get_verts_buff(self):
		return self.verts_buff
	def set_verts_buff(self, verts_buff):
		self.verts_buff = verts_buff

	def get_norms_buff(self):
		return self.norms_buff
	def set_norms_buff(self, norms_buff):
		self.norms_buff = norms_buff

	def get_uvs_buff(self):
		return self.uvs_buff
	def set_uvs_buff(self, uvs_buff):
		self.uvs_buff = uvs_buff

	def get_is_bump(self):
		return self.isBump
	def set_is_bump(self, isBump):
		self.isBump = isBump


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
	pos_arr = []
	nor_arr = []
	uv_arr = []
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
					mesh.set_is_bump(1)
			else:
				mesh = None
	if fp != None:
		f = open(fp, 'r')
		lines = f.readlines()
		mesh = None
		vertices = []
		normals = []
		uvs = []
		faces_pos = []
		faces_nors = []
		faces_uvs = []
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
						pos_arr.append(vs[i])
				if l[0] == 'vn':
					vns = getNormals(l)
					for i in range(len(vns)):
						normals.append(vns[i])
						nor_arr.append(vns[i])
					l1 = lines[i-1].split()
					if l1[0] == 'v':
						mesh.set_vertices(vertices)
						vertices = []
				if l[0] == 'vt':
					vts = getUVs(l)
					for i in range(len(vts)):
						uvs.append(vts[i])
						uv_arr.append(vts[i])
					l1 = lines[i - 1].split()
					if l1[0] == 'vn':
						mesh.set_normals(normals)
						normals = []
				if l[0] == 'f':
					for i in range(len(l)):
						if i == 0:
							continue
						else:
							m = l[i].split('/')
							faces_pos.append(m[0])
							faces_nors.append(m[2])
							faces_uvs.append(m[1])
					l1 = lines[i - 1].split()
					if l1:
						if l1[0] == 'vt':
							mesh.set_uvs(uvs)
							uvs = []
			else:
				l1 = lines[i - 1].split()
				if l1 and l1[0] == 'f':
					if mesh.get_verts_buff():
						tmp_verts = mesh.get_verts_buff()
					else: 
						tmp_verts = []
					if mesh.get_norms_buff():
						tmp_norms = mesh.get_norms_buff()
					else:
						tmp_norms = []
					if mesh.get_uvs_buff():
						tmp_uvs = mesh.get_uvs_buff()
					else:
						tmp_uvs = []

					for i in range(len(faces_pos)):
						tmp_verts.append(pos_arr[int(faces_pos[i]) * 3 - 3])
						tmp_verts.append(pos_arr[int(faces_pos[i]) * 3 - 2])
						tmp_verts.append(pos_arr[int(faces_pos[i]) * 3 - 1])
					mesh.set_verts_buff(tmp_verts)
					mesh.set_verts(len(tmp_verts))
					for i in range(len(faces_nors)):
						tmp_norms.append(nor_arr[int(faces_nors[i]) * 3 - 3])
						tmp_norms.append(nor_arr[int(faces_nors[i]) * 3 - 2])
						tmp_norms.append(nor_arr[int(faces_nors[i]) * 3 - 1])
					mesh.set_norms_buff(tmp_norms)
					for i in range(len(faces_uvs)):
						tmp_uvs.append(uv_arr[int(faces_uvs[i]) * 2 - 2])
						tmp_uvs.append(uv_arr[int(faces_uvs[i]) * 2 - 1])
					mesh.set_uvs_buff(tmp_uvs)
					faces_pos = []
					faces_nors = []
					faces_uvs = []

	for i in range(len(MeshArray)):
		mesh = MeshArray[i]
		pos_buff = mesh.get_verts_buff()
		uv_buff = mesh.get_uvs_buff()

		for j in new_range(0, mesh.get_verts(), 3):
			point_1 = Vectors3D(pos_buff[3 * j], pos_buff[3 * j + 1], pos_buff[3 * j + 2])
			point_2 = Vectors3D(pos_buff[3 * j + 3], pos_buff[3 * j + 4], pos_buff[3 * j + 5])
			point_3 = Vectors3D(pos_buff[3 * j + 6], pos_buff[3 * j + 7], pos_buff[3 * j + 8])

			uv_1 = Vectors2D(uv_buff[2 * j], uv_buff[2 * j] + 1)
			uv_2 = Vectors2D(uv_buff[2 * j + 2], uv_buff[2 * j] + 3)
			uv_3 = Vectors2D(uv_buff[2 * j] + 4, uv_buff[2 * j] + 5)

			deltaPos1 = subVector3D(point_1, point_2)
			deltaPos2 = subVector3D(point_1, point_3)

			deltaUv1 = subVector2D(uv_1, uv_2)
			deltaUv2 = subVector2D(uv_1, uv_3)

			r = 1.0 / (deltaUv1.get_x() * deltaUv2.get_y() - deltaUv1.get_y() * deltaUv2.get_x())

			tangent = mulVector3DWithConst(r, sub2Vector3D(mulVector3DWithConst(deltaUv2.get_y() * deltaPos1), mulVector3DWithConst(deltaUv1.get_y() * deltaPos2)))
			bit_tangent = mulVector3DWithConst(r, sub2Vector3D(mulVector3DWithConst(deltaUv1.get_x() * deltaPos2), mulVector3DWithConst(deltaUv2.get_x() * deltaPos1)))

	datas = []
	for i in range(len(MeshArray)):
		data = {
			'name' : MeshArray[i].get_name(),
			'verts' : MeshArray[i].get_verts_buff(),
			'normals' : MeshArray[i].get_norms_buff(),
			'uvs' : MeshArray[i].get_uvs_buff(),
			'diffuse' : MeshArray[i].get_diffuse(),
			'ambient' : MeshArray[i].get_ambient(),
			'specular' : MeshArray[i].get_specular(),
			'alpha' : MeshArray[i].get_alpha(),
			'isBump' : MeshArray[i].get_is_bump(),
			'textures' : MeshArray[i].get_text_diff(),
			'bumpMap' : MeshArray[i].get_text_norm(),
		}
		datas.append(data)

	with open('C:\\Users\\andrew_nguyen\\Downloads\\hihi\\data.json', 'w') as outfile:
		try :
			data = ""
			if MeshArray:
				data += "data = ["
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
