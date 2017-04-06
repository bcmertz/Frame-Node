#most current version of our server that can handle streams and uploaded videos

from http.server import BaseHTTPRequestHandler, HTTPServer
import socketserver
import requests
import cgi
import cgitb
from io import StringIO
import pycurl
import json
from io import BytesIO
import math
import numpy as np
import time
from skimage.measure import structural_similarity as ssim
import os
import cv2
import boto3
# from photo import parseVideo, awsSave, arr1

image_url = 'https://s3-us-west-1.amazonaws.com/mybucket-bennettmertz/pics1.jpg'

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        print ("in post method")
        cgitb.enable()

        content_len = int(self.headers.get('Content-Length'))
        post_body = self.rfile.read(content_len)
        photoFile = post_body.decode("utf-8")
        print('photoFile address', photoFile)

        # photoFile = 'https://s3-us-west-1.amazonaws.com/mybucket-bennettmertz/pics1.jpg'
        os.system("python classify_image.py " + image_url)

        # print ("Image Classification Complete, sending data to node server", arr69)
        # #POST BACK TO NODE SERVER THE LINKS FROM AWS
        # payload = {
        # 'source': arr1
        # }
        # headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        # res = requests.post('http://localhost:3000/results', headers=headers, data=json.dumps(payload))

        return

def run(server_class=HTTPServer, handler_class=Handler, port=8080):
    server_address = ('http://sample-env.m359bd53gp.us-west-2.elasticbeanstalk.com/', 80)
    httpd = server_class(server_address, handler_class)
    print ('python server running')
    httpd.serve_forever()
def main():
    print ("in main")
    #####move to inside post for actual use of posted images
    # os.system("python classify_image.py " + image_url)
    # return
    #####move to inside post for actual use of posted images
    run()  #uncomment laterrrr as described above

if __name__ == '__main__':
    # execute video parsing code
    main()
