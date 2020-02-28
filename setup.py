import os
from setuptools import setup

from python.gaia import __version__

# Utility function to read the README file.
# Used for the long_description.  It's nice, because now 1) we have a top level
# README file and 2) it's easier to type in the README file than to put a raw
# string in below ...
def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()

settings = dict(
    name = 'gaia.py',
    packages = ['gaia'],
    package_dir = {
        '': 'python'
    },
    version = __version__,
    author = 'kaelzhang',
    author_email = '',
    description = ('Gaia, the very framework to make gRPC services'),
    license = 'MIT',
    keywords = 'gaia grpc framework server client',
    url = 'https://github.com/kaelzhang/gaia',
    long_description=read('README.md'),
    long_description_content_type='text/markdown',
    python_requires='>=3.7',
    classifiers=[
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: Implementation :: PyPy',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'License :: OSI Approved :: MIT License',
    ]
)

setup(**settings)
