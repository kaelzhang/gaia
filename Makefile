test:
	pytest -s -v test/test_*.py --doctest-modules --cov binance --cov-config=.coveragerc --cov-report term-missing

install:
	pip install -r requirement.txt -r test-requirement.txt

report:
	codecov

build: binance
	rm -rf dist
	python setup.py sdist bdist_wheel

publish:
	make build
	twine upload --config-file ~/.pypirc -r pypi dist/*

.PHONY: test
