test:
	pytest -s -v python/test/test_*.py --doctest-modules --cov binance --cov-config=.coveragerc --cov-report term-missing

install:
	pip install -r requirement.txt -r test-requirement.txt

protoc:
	python -m grpc_tools.protoc -Iexample/hello/proto --python_out=example/hello/protoc --grpc_python_out=example/hello/protoc example/hello/proto/hello.proto

report:
	codecov

build:
	rm -rf dist
	python setup.py sdist bdist_wheel

publish:
	make build
	twine upload --config-file ~/.pypirc -r pypi dist/*

.PHONY: test build
