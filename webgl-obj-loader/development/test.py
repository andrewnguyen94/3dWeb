import os
import sys

def main():
	if sys.argv[1] != None:
		fp = sys.argv[1]

	if fp != None:
		f = open(fp, 'r')
		for line in f:
			


if __name__ == '__main__':
	main()