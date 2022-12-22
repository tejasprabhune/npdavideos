import json
import re

def parse_json():
    round_file = open("rounds_info.json")
    round_info = json.load(round_file)


    contents = round_info.get("body").get("content")
    doc_text = ""
    current_link = ""

    for content in contents:
        if "paragraph" in content.keys():
            for element in content.get("paragraph").get("elements"):
                if "textRun" in element.keys():
                    text_run = element.get("textRun")
                    doc_text += text_run.get("content")
                    if "link" in text_run.get("textStyle"):
                        current_link = text_run.get("textStyle").get("link").get("url")
            if current_link != "":
                doc_text += "https://dl" + current_link[11:] + "\n"
                current_link = ""

    with open("parsed_round_info.txt", "w") as f:
        f.write(doc_text)

def clean_parsed_json():
    with open("parsed_round_info.txt") as f:
        lines = f.read().split("\n\n")

    for i in range(0, len(lines)):
        while re.search('_', lines[i]):
            lines[i] = lines[i][1:]
        if lines[i] != "" and lines[i][0] == "\n":
            lines[i] = lines[i][1:]

    lines = [line for line in lines if line != ""]

    preamble = lines[:8]
    lines = lines[8:]

    rounds = []
    current_year = ""
    current_tournament = ""
    years = []
    tourneys = []
    keys = ["title", "link", "resolution", "aff", "neg", "_tags", "decision"]

    for line in lines:
        if line[0:2] == "20":
            current_year = line
        elif "vs" in line:
            round_lines = line.split("\n")
            if len(round_lines) >= 7:
                current_round = {}
                for i in range(len(keys)):
                    if ": " in round_lines[i]:
                        current_round[keys[i]] = round_lines[i][round_lines[i].find(": ") + 2:].strip()
                    else:
                        current_round[keys[i]] = round_lines[i].strip()
                current_round["year"] = current_year
                current_round["tournament"] = current_tournament
                rounds.append(current_round)
        else:
            current_tournament = line
    
    rounds = [round for round in rounds if round["tournament"] != "Practice Rounds"]
    for round in rounds:
        round["_tags"] = round["_tags"].split(",")
        round["_tags"] = [tag.strip() for tag in round["_tags"]]

        team1 = round["title"][round["title"].find("-") + 1:round["title"].find("vs")].strip()
        team2 = round["title"][round["title"].find("vs") + 2:].strip()
        round["teams"] = [team1, team2]
    
    with open("all_rounds.json", "w") as f:
        json.dump(rounds, f, indent=4)

def head(lines, first, second):
    for i in range(first, second):
        print(lines[i] + "\n")
    
clean_parsed_json()