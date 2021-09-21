from chat_downloader.sites import YouTubeChatDownloader
import sys

def get_stream_ids():
    stream_list = YouTubeChatDownloader().get_user_videos(channel_id=sys.argv[1], video_status='past');
    video_id_list = [video_id['video_id'] for video_id in stream_list];
    for video_id in video_id_list:
        print(video_id);

if __name__ == "__main__":
    get_stream_ids()