# The python implementation which corresponds
#   https://github.com/kaelzhang/gaia/blob/master/example/hello/controller/Greeter.js

import asyncio

def SayHello(helloRequest, HelloReply):
    return HelloReply(message = f'Hello {helloRequest.name}')

async def DelayedSayHello(*args):
    await asyncio.sleep(300)
    return SayHello(*args)
