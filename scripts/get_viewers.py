import chat_downloader
import json
import sys

def main():
    # test_url = 'https://www.youtube.com/watch?v=yBBjqi-4gcs' 
    chatter_data = {'success': 0, 'unique_chatter_count': 0, 'chatter_list': []}
    try:
        input_url = sys.argv[1]
        chat = chat_downloader.ChatDownloader().get_chat(input_url)
        chatter_data['success'] = 1
        chatter_list = set()
        for message in chat:
            chatter_id = message['author']['id']
            chatter_list.add(chatter_id)
        chatter_data['unique_chatter_count'] = len(chatter_list)
        chatter_data['chatter_list'] += chatter_list
    except:
        pass
    json_chatter_data = json.dumps(chatter_data)
    print(json_chatter_data)

if __name__ == "__main__":
    main()