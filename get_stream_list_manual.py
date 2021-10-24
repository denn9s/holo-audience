from bs4 import BeautifulSoup
import sys

def get_stream_ids():
    video_id_list = []
    file_name = sys.argv[2]; # HTML file name of video listing page
    with open(file_name, encoding="utf8") as html_file:
        soup = BeautifulSoup(html_file, features = 'html.parser')
        for video in soup.findAll("ytd-grid-video-renderer"):
            video_link = video.find('a')['href']
            video_id = video_link[32:43]
            video_id_list.append(video_id)
    for id in video_id_list:
        print(id)

if __name__ == "__main__":
    get_stream_ids()