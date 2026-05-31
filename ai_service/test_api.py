import urllib.request
import json
req = urllib.request.Request('http://localhost:8000/api/chat', 
    data=json.dumps({'role':'bacsi','message':'Phân tích hồ sơ bệnh nhân','history':[]}).encode('utf-8'), 
    headers={'Content-Type':'application/json'})
res = urllib.request.urlopen(req).read().decode('utf-8')
with open('test_ai.json', 'w', encoding='utf-8') as f:
    f.write(res)
