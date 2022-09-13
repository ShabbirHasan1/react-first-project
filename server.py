import json
from websocket import create_connection
import random
import string
import re
import json
from threading import Thread
from websocket_server import WebsocketServer, WebSocketHandler
# --------
class websocketRSI():
    def __init__(self, symbol="ETHUSDT", __callback=None):
        self.callback = __callback
        self.redisKey = 'rsi-'+symbol
        self.headers = json.dumps({
            'Origin': 'https://data.tradingview.com'
        })
        self.ws = create_connection('wss://data.tradingview.com/socket.io/websocket',headers=self.headers)
        session= self.generateSession()
        print("session generated {}".format(session))

        chart_session= self.generateChartSession()
        print("chart_session generated {}".format(chart_session))

        # Then send a message through the tunnel 
        ws = self.ws
        self.sendMessage(ws, "set_auth_token", ["unauthorized_user_token"])
        self.sendMessage(ws, "chart_create_session", [chart_session, ""])
        self.sendMessage(ws, "quote_create_session", [session])
        self.sendMessage(ws,"quote_set_fields", [session,"ch","chp","current_session","description","local_description","language","exchange","fractional","is_tradable","lp","lp_time","minmov","minmove2","original_name","pricescale","pro_name","short_name","type","update_mode","volume","currency_code","rchp","rtc"])
        self.sendMessage(ws, "quote_add_symbols",[session, f"BINANCE:{symbol}", {"flags":['force_permission']}])

        self.sendMessage(ws, "resolve_symbol", [chart_session, "symbol_1","={\"symbol\":\"BINANCE:"+symbol+"\",\"adjustment\":\"splits\"}"])
        self.sendMessage(ws, "create_series", [chart_session,"s1","s1","symbol_1","1",300])
        self.sendMessage(ws, "quote_fast_symbols", [session,f"BINANCE:{symbol}"])

        self.sendMessage(ws, "create_study", [chart_session,"st1","st1","s1","Script@tv-scripting-101!",{"text":"1f0fkZ72S0de2geyaUhXXw==_xwY73vljRXeew69Rl27RumLDs6aJ9NLsTYN9Xrht254BTb8uSOgccpLDt/cdRWopwJPNZx40m19yEFwJFswkSi62X4guNJYpXe4A6S9iq2n+OXM6mqWeWzDbjTl0lYmEf1ujbg7i3FvUdV/zCSrqd+iwnvvZSV+O2acpfNLpUlDdB6PZX4Y9y8tlQLWA2PiF8CVJng7DF1LPeecWC4fv+lNg+s5OXU46AjIhc+TFu8DOwiuKjNh7wWz6EZ7gpQS3","pineId":"STD;RSI","pineVersion":"30.0","in_2":{"v":"","f":True,"t":"resolution"},"in_0":{"v":14,"f":True,"t":"integer"},"in_1":{"v":"close","f":True,"t":"source"}}])
        self.sendMessage(ws, "quote_hibernate_all", [session])
    
    def filter_raw_message(text):
        try:
            found = re.search('"m":"(.+?)",', text).group(1)
            found2 = re.search('"p":(.+?"}"])}', text).group(1)
            print(found)
            print(found2)
            return found, found2
        except AttributeError:
            print("error")
    

    def generateSession(self):
        stringLength=12
        letters = string.ascii_lowercase
        random_string= ''.join(random.choice(letters) for i in range(stringLength))
        return "qs_" +random_string

    def generateChartSession(self):
        stringLength=12
        letters = string.ascii_lowercase
        random_string= ''.join(random.choice(letters) for i in range(stringLength))
        return "cs_" +random_string

    def prependHeader(self, st):
        return "~m~" + str(len(st)) + "~m~" + st

    def constructMessage(self, func, paramList):
        #json_mylist = json.dumps(mylist, separators=(',', ':'))
        return json.dumps({
            "m":func,
            "p":paramList
        }, separators=(',', ':'))

    def createMessage(self, func, paramList):
        return self.prependHeader(self.constructMessage(func, paramList))

    def sendRawMessage(self, ws, message):
        ws.send(self.prependHeader(message))
        return
    
    def sendMessage(self, ws, func, args):
        ws.send(self.createMessage(func, args))
        return
    
    def newMessage(self, msg):
        # print(msg)
        # ~m~199~m~{"m":"du","p":["cs_saydeutqehrd",{"s1":{"s":[{"i":300,"v":[1663050540.0,1721.18,1721.75,1721.17,1721.74,229.7826]}],"ns":{"d":"","indexes":"nochange"},"t":"s1","lbs":{"bar_close_time":1663050600}}}]}
        if '"m":"du"' in msg:
            
            # text = msg.split('~m~')[1]
            try:
                pr = msg.split('"v":[')[1].split(',')[1]
                if float(pr):
                    # print(pr)
                    if self.callback != None:
                        print("Callback: ", pr)
                        self.callback(pr)
                
            except:
                pass
        if '"st":' in msg:
            out= re.search('"st":\[(.+?)\}\]', msg).group(1)
            x=out.split(',{\"')
            rsi = str(x[0]).split('"v":[')[1].split(',')[1].split(']')[0]
    
    def startProcess(self, interval=0, __stopFunc=None):
        self.time = interval
        self.__process = True
        self.lastProcessTime = 0
        print('*** Process WEBSOCKET Started ****')
        Thread(target=self.receive, args=(interval,__stopFunc,)).start()
        
        return
    
    def stopProcess(self):
        self.__process = False
        return
    
    def receive(self, interval, __stopFunc):
        ws = self.ws
        
        while self.__process:
            try:
                if __stopFunc != None and __stopFunc() == True:
                    self.startProcess()
                result = ws.recv()
                pattern = re.compile("~m~\d+~m~~h~\d+$")
                if pattern.match(result):
                    ws.recv()
                    ws.send(result)
                self.newMessage(result)
                if not self.__process:
                    print('*** Process WEBSOCKET Stoped ****')
                    break
            except Exception as e:
                print(e)
                continue



__db = {
    'symbols': {}
}

def p(p):
    print(p)
    
# x = websocketRSI("ETHUSDT", p)
# x.startProcess()

def new_client(client, server: WebsocketServer):
    print(f"New client connected and was given id {client['id']}")
    server.send_message(client, "{'connect': 'ok'}")

def client_left(client, server):
    print("Client(%d) disconnected" % client['id'])
    global __db
    for item in __db["symbols"][str(client['id']).replace(" ", "")]:
        print(item)
        item['x'].stopProcess()
    
    
def message_received(client, server: WebsocketServer, message):
    global __db
    print(client['id'])
    try:
        jsd = json.loads(message)
        # Handle
        
        # {'add_coin': 'ETHUSDT'}
        if 'add_coin' in jsd:
            print(jsd)
            # def price(price__):
                
            
            
            print(__db)
            x = websocketRSI(jsd['add_coin'], lambda p: server.send_message(client, json.dumps({"symbol": jsd['add_coin'], "coin_price": p}))) 
            x.startProcess()           
            
            
            # print("start")
            
            
            
            
        
        if 'del_coin' in jsd:
            if jsd['del_coin'] in __db["symbols"]:
                del __db["symbols"][jsd['del_coin']]
            
        else:
            server.send_message(client, '{"ping": "pong"}')
    except Exception as e:
        print(e)
        pass
    # __db["symbols"][str(client['id']).replace(" ", "")][jsd['add_coin']] = {
    #             'server': server,
    #             'client': client,
    #             'x': x
    #         }

PORT=8080
server = WebsocketServer(host='0.0.0.0', port = PORT)
server.set_fn_new_client(new_client)
server.set_fn_client_left(client_left)
server.set_fn_message_received(message_received)
server.run_forever()