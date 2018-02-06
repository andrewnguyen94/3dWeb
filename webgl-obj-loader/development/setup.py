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
		

def subVector3D(a, b):
	a_x = a.get_x()
	a_y = a.get_y()
	a_z = a.get_z()

	b_x = b.get_x()
	b_y = b.get_y()
	b_z = b.get_z()

	c_x = float(b_x) - float(a_x)
	c_y = float(b_y) - float(a_y)
	c_z = float(b_z) - float(a_z)

	return Vectors3D(c_x, c_y, c_z)

def sub2Vector3D(a, b):
	return Vectors3D(a.get_x() - b.get_x(), a.get_y() - b.get_y(), a.get_z() - b.get_z())

def subVector2D(a,b):
	a_x = a.get_x()
	a_y = a.get_y()

	b_x = b.get_x()
	b_y = b.get_y()

	c_x = float(b_x) - float(a_x)
	c_y = float(b_y) - float(a_y)

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
		self.verts = 0
		self.indices = []
		self.hashobjs = []
		self.currentIndex = 0
		self.pos_buff_tangent = []
		self.uv_buff_tangent = []
		self.indicesToRemove = []
		self.all_curr_index = 0
		self.ambients = []
		self.diffuses = []
		self.speculars = []

	def set_speculars(self, speculars):
		self.speculars = speculars
	def get_speculars(self):
		return self.speculars

	def set_diffuses(self, diffuses):
		self.diffuses = diffuses
	def get_diffuses(self):
		return self.diffuses

	def set_ambients(self, ambients):
		self.ambients = ambients
	def get_ambients(self):
		return self.ambients

	def set_all_curr_index(self, all_curr_index):
		self.all_curr_index = all_curr_index
	def get_all_cur_index(self):
		return self.all_curr_index

	def set_indicesToRemove(self, indicesToRemove):
		self.indicesToRemove = indicesToRemove
	def get_indicesToRemove(self):
		return self.indicesToRemove

	def set_pos_buff_tangent(self, pos_buff_tangent):
		self.pos_buff_tangent = pos_buff_tangent
	def get_pos_buff_tangent(self):
		return self.pos_buff_tangent

	def set_uv_buff_tangent(self, uv_buff_tangent):
		self.uv_buff_tangent = uv_buff_tangent
	def get_uv_buff_tangent(self):
		return self.uv_buff_tangent

	def set_currentIndex(self, id):
		self.currentIndex = id
	def get_currentIndex(self):
		return self.currentIndex

	def set_hashobjs(self, hashobjs):
		self.hashobjs = hashobjs
	def get_hashobjs(self):
		return self.hashobjs

	def set_indices(self, indices):
		self.indices = indices
	def get_indices(self):
		return self.indices

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

class Hash(object):
	"""docstring for Hash"""
	def __init__(self, name, index):
		self.name = name
		self.index = index

	def get_name(self):
		return self.name

	def get_index(self):
		return self.index
		
		


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

def get_hash_obj(hashname, hashObjects):
	if hashObjects:
		for hashobj in hashObjects:
			if hashobj.get_name() == hashname:
				return hashobj

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
		index = 0
		vertices = []
		normals = []
		uvs = []
		faces_pos = []
		faces_nors = []
		faces_uvs = []
		face_pos_tang = []
		face_uv_tang = []
		indexToRemove = 0
		indicesToRemove = []
		all_curr_index = 0
		for i in range(len(lines)):
			l = lines[i].split()
			if l:
				if l[0] == 'usemtl':
					name = getName(l)
					print name
					mesh = getMeshFromName(name, MeshArray)
					index = mesh.get_currentIndex()
					indicesToRemove = mesh.get_indicesToRemove()
					all_curr_index = mesh.get_all_cur_index()
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
							all_curr_index = all_curr_index + 1
							mesh.set_all_curr_index(all_curr_index)
							m = l[i].split('/')
							face_pos_tang.append(m[0])
							face_uv_tang.append(m[1])
							if faces_pos == None:
								faces_pos.append(m[0])
							else:
								if m[0] not in faces_pos:
									faces_pos.append(m[0])
								else:
									indexToRemove = all_curr_index
									indicesToRemove.append(indexToRemove)
									mesh.set_indicesToRemove(indicesToRemove)
							if faces_nors == None:
								faces_nors.append(m[0])
							else:
								if m[2] not in faces_nors:
									faces_nors.append(m[2])

							if faces_uvs == None:
								faces_uvs.append(m[1])
							else:
								if m[1] not in faces_uvs:
									faces_uvs.append(m[1])
							idtmp = mesh.get_indices()
							hashname = l[i] + "," + mesh.get_name()
							hashObjects = mesh.get_hashobjs()
							hashobj = get_hash_obj(hashname, hashObjects)
							if hashobj:
								idtmp.append(hashobj.get_index())
								mesh.set_indices(idtmp)
							else:
								hashtmp = Hash(hashname, index)
								hashObjects.append(hashtmp)
								mesh.set_hashobjs(hashObjects)
								idtmp.append(index)
								mesh.set_indices(idtmp)
								index = index + 1

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
					tmp_pos_tang = mesh.get_pos_buff_tangent()
					tmp_uv_tang = mesh.get_uv_buff_tangent()
					for i in range(len(faces_pos)):
						tmp_verts.append(pos_arr[int(faces_pos[i]) * 3 - 3])
						tmp_verts.append(pos_arr[int(faces_pos[i]) * 3 - 2])
						tmp_verts.append(pos_arr[int(faces_pos[i]) * 3 - 1])
					mesh.set_verts_buff(tmp_verts)
					mesh.set_verts(len(tmp_verts) / 3)
					for i in range(len(faces_nors)):
						tmp_norms.append(nor_arr[int(faces_nors[i]) * 3 - 3])
						tmp_norms.append(nor_arr[int(faces_nors[i]) * 3 - 2])
						tmp_norms.append(nor_arr[int(faces_nors[i]) * 3 - 1])
					mesh.set_norms_buff(tmp_norms)
					for i in range(len(faces_uvs)):
						tmp_uvs.append(uv_arr[int(faces_uvs[i]) * 2 - 2])
						tmp_uvs.append(uv_arr[int(faces_uvs[i]) * 2 - 1])
					mesh.set_uvs_buff(tmp_uvs)
					for i in range(len(face_pos_tang)):
						tmp_pos_tang.append(pos_arr[int(face_pos_tang[i]) * 3 - 3])
						tmp_pos_tang.append(pos_arr[int(face_pos_tang[i]) * 3 - 2])
						tmp_pos_tang.append(pos_arr[int(face_pos_tang[i]) * 3 - 1])
					mesh.set_pos_buff_tangent(tmp_pos_tang)
					for i in range(len(face_uv_tang)):
						tmp_uv_tang.append(uv_arr[int(face_uv_tang[i]) * 2 - 2])
						tmp_uv_tang.append(uv_arr[int(face_uv_tang[i]) * 2 - 1])
					mesh.set_uv_buff_tangent(tmp_uv_tang)
					mesh.set_currentIndex(index);
					faces_pos = []
					faces_nors = []
					faces_uvs = []
					face_pos_tang = []
					face_uv_tang = []
		else:
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
			tmp_pos_tang = mesh.get_pos_buff_tangent()
			tmp_uv_tang = mesh.get_uv_buff_tangent()
			for i in range(len(faces_pos)):
				tmp_verts.append(pos_arr[int(faces_pos[i]) * 3 - 3])
				tmp_verts.append(pos_arr[int(faces_pos[i]) * 3 - 2])
				tmp_verts.append(pos_arr[int(faces_pos[i]) * 3 - 1])
			mesh.set_verts_buff(tmp_verts)
			mesh.set_verts(len(tmp_verts) / 3)
			for i in range(len(faces_nors)):
				tmp_norms.append(nor_arr[int(faces_nors[i]) * 3 - 3])
				tmp_norms.append(nor_arr[int(faces_nors[i]) * 3 - 2])
				tmp_norms.append(nor_arr[int(faces_nors[i]) * 3 - 1])
			mesh.set_norms_buff(tmp_norms)
			for i in range(len(faces_uvs)):
				tmp_uvs.append(uv_arr[int(faces_uvs[i]) * 2 - 2])
				tmp_uvs.append(uv_arr[int(faces_uvs[i]) * 2 - 1])
			mesh.set_uvs_buff(tmp_uvs)
			for i in range(len(face_pos_tang)):
				tmp_pos_tang.append(pos_arr[int(face_pos_tang[i]) * 3 - 3])
				tmp_pos_tang.append(pos_arr[int(face_pos_tang[i]) * 3 - 2])
				tmp_pos_tang.append(pos_arr[int(face_pos_tang[i]) * 3 - 1])
			mesh.set_pos_buff_tangent(tmp_pos_tang)
			for i in range(len(face_uv_tang)):
				tmp_uv_tang.append(uv_arr[int(face_uv_tang[i]) * 2 - 2])
				tmp_uv_tang.append(uv_arr[int(face_uv_tang[i]) * 2 - 1])
			mesh.set_uv_buff_tangent(tmp_uv_tang)
			mesh.set_currentIndex(index);
			faces_pos = []
			faces_nors = []
			faces_uvs = []
			face_pos_tang = []
			face_uv_tang = []

	for i in range(len(MeshArray)):
		mesh = MeshArray[i]
		pos_buff = mesh.get_pos_buff_tangent()
		uv_buff = mesh.get_uv_buff_tangent()
		ambients = mesh.get_ambients()
		ambient = mesh.get_ambient()
		diffuses = mesh.get_diffuses()
		diffuse = mesh.get_diffuse()
		speculars = mesh.get_speculars()
		specular = mesh.get_specular()
		if mesh.get_verts():
			for j in new_range(0, len(pos_buff) / 3 - 1, 3):
				if mesh.get_tangents():
					ts = mesh.get_tangents()
				else:
					ts = []

				if mesh.get_bit_tangents():
					bts = mesh.get_bit_tangents()
				else:
					bts = []

				point_1 = Vectors3D(pos_buff[3 * j], pos_buff[3 * j + 1], pos_buff[3 * j + 2])
				point_2 = Vectors3D(pos_buff[3 * j + 3], pos_buff[3 * j + 4], pos_buff[3 * j + 5])
				point_3 = Vectors3D(pos_buff[3 * j + 6], pos_buff[3 * j + 7], pos_buff[3 * j + 8])

				uv_1 = Vectors2D(uv_buff[2 * j], uv_buff[2 * j + 1])
				uv_2 = Vectors2D(uv_buff[2 * j + 2], uv_buff[2 * j + 3])
				uv_3 = Vectors2D(uv_buff[2 * j + 4], uv_buff[2 * j + 5])

				deltaPos1 = subVector3D(point_1, point_2)
				deltaPos2 = subVector3D(point_1, point_3)

				deltaUv1 = subVector2D(uv_1, uv_2)
				deltaUv2 = subVector2D(uv_1, uv_3)

				if deltaUv1.get_x() * deltaUv2.get_y() - deltaUv1.get_y() * deltaUv2.get_x():
					r = 1.0 / (deltaUv1.get_x() * deltaUv2.get_y() - deltaUv1.get_y() * deltaUv2.get_x())
					tangent = mulVector3DWithConst(r, sub2Vector3D(mulVector3DWithConst(deltaUv2.get_y(),deltaPos1), mulVector3DWithConst(deltaUv1.get_y(),deltaPos2)))
					bit_tangent = mulVector3DWithConst(r, sub2Vector3D(mulVector3DWithConst(deltaUv1.get_x(),deltaPos2), mulVector3DWithConst(deltaUv2.get_x(),deltaPos1)))
				else:
					tangent = Vectors3D(1,1,1)
					bit_tangent = Vectors3D(1,1,1)

				#set tangent
				for jj in range(3):
					ts.append(tangent.get_x())
					ts.append(tangent.get_y())
					ts.append(tangent.get_z())
					#set bit tangent
					bts.append(bit_tangent.get_x())
					bts.append(bit_tangent.get_y())
					bts.append(bit_tangent.get_z())
					#set ambient
					ambients.append(ambient[0])
					ambients.append(ambient[1])
					ambients.append(ambient[2])
					#set diffuse
					diffuses.append(diffuse[0])
					diffuses.append(diffuse[1])
					diffuses.append(diffuse[2])
					#set specular
					speculars.append(specular[0])
					speculars.append(specular[1])
					speculars.append(specular[2])

				mesh.set_tangents(ts)
				mesh.set_bit_tangents(bts)
				mesh.set_ambients(ambients)
				mesh.set_diffuses(diffuses)
				mesh.set_speculars(speculars)

	for i in range(len(MeshArray)):
		mesh = MeshArray[i]
		if mesh.get_verts() and mesh.get_indicesToRemove():
			print len(mesh.get_indicesToRemove()), len(mesh.get_tangents())
			count = 0
			for j in range(len(mesh.get_indicesToRemove())):
				tangents = mesh.get_tangents()
				bit_tangent = mesh.get_bit_tangents()
				ambients = mesh.get_ambients()
				diffuses = mesh.get_diffuses()
				speculars = mesh.get_speculars()

				tangents.remove(tangents[(mesh.get_indicesToRemove()[j] - 1) * 3 - count])
				bit_tangent.remove(bit_tangent[(mesh.get_indicesToRemove()[j] - 1) * 3 - count])
				speculars.remove(speculars[(mesh.get_indicesToRemove()[j] - 1) * 3 - count])
				ambients.remove(ambients[(mesh.get_indicesToRemove()[j] - 1) * 3 - count])
				diffuses.remove(diffuses[(mesh.get_indicesToRemove()[j] - 1) * 3 - count])

				count = count + 3
				tangents.remove(tangents[(mesh.get_indicesToRemove()[j] - 1) * 3 + 1 - count])
				bit_tangent.remove(bit_tangent[(mesh.get_indicesToRemove()[j] - 1) * 3 + 1 - count])
				speculars.remove(speculars[(mesh.get_indicesToRemove()[j] - 1) * 3 + 1 - count])
				ambients.remove(ambients[(mesh.get_indicesToRemove()[j] - 1) * 3 + 1 - count])
				diffuses.remove(diffuses[(mesh.get_indicesToRemove()[j] - 1) * 3 + 1 - count])

				count = count + 3
				tangents.remove(tangents[(mesh.get_indicesToRemove()[j] - 1) * 3 + 2 - count])
				bit_tangent.remove(bit_tangent[(mesh.get_indicesToRemove()[j] - 1) * 3 + 2 - count])
				speculars.remove(speculars[(mesh.get_indicesToRemove()[j] - 1) * 3 + 2 - count])
				ambients.remove(ambients[(mesh.get_indicesToRemove()[j] - 1) * 3 + 2 - count])
				diffuses.remove(diffuses[(mesh.get_indicesToRemove()[j] - 1) * 3 + 2 - count])



	datas = []
	for i in range(len(MeshArray)):
		data = {
			'name' : MeshArray[i].get_name(),
			'verts' : MeshArray[i].get_verts_buff(),
			'normals' : MeshArray[i].get_norms_buff(),
			'uvs' : MeshArray[i].get_uvs_buff(),
			'diffuse' : MeshArray[i].get_diffuses(),
			'ambient' : MeshArray[i].get_ambients(),
			'specular' : MeshArray[i].get_speculars(),
			'alpha' : MeshArray[i].get_alpha(),
			'isBump' : MeshArray[i].get_is_bump(),
			'textures' : MeshArray[i].get_text_diff(),
			'bumpMap' : MeshArray[i].get_text_norm(),
			'tangent' : MeshArray[i].get_tangents(),
			'bitTangent' : MeshArray[i].get_bit_tangents(),
			'indices' : MeshArray[i].get_indices(),
		}
		datas.append(data)

	with open('/Volumes/Elements/hohohoho/data.json', 'w') as outfile:
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