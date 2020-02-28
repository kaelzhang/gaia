import pkg_resources
import sys

from grpc_tools import _protoc_compiler


def main(command_arguments):
    """Run the protocol buffer compiler with the given command-line arguments.

  Args:
    command_arguments: a list of strings representing command line arguments to
        `protoc`.
  """
    command_arguments = [argument.encode() for argument in command_arguments]
    return _protoc_compiler.run_main(command_arguments)


if __name__ == '__main__':
    proto_include = pkg_resources.resource_filename('grpc_tools', '_proto')
    sys.exit(main(sys.argv + ['-I{}'.format(proto_include)]))

def protoc(
    include_dirs
):
    pass

