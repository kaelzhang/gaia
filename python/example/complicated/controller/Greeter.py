# The python implementation which corresponds
#   https://github.com/kaelzhang/gaia/blob/master/example/complicated/controller/Greeter.js

import asyncio

def SayHello(helloRequest, HelloReply, this):
    return this.service.hello.Greeter.SayHello(helloRequest, HelloReply)
