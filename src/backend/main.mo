import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Outcall "http-outcalls/outcall";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Video = {
    id : Text;
    youtubeVideoId : Text;
    title : Text;
    description : Text;
    publishedAt : Text;
    thumbnailUrl : Text;
    createdAt : Time.Time;
  };

  module Video {
    public func compareByPublished(v1 : Video, v2 : Video) : Order.Order {
      Text.compare(v2.publishedAt, v1.publishedAt);
    };
  };

  var cachedVideos : [Video] = [];
  var lastFetchTime : Int = 0;

  let YOUTUBE_RSS_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=UCuUtbOjdXceldqYLbSP8gmQ";

  public query func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  func extractBetween(text : Text, startTag : Text, endTag : Text) : ?Text {
    let partsIter = text.split(#text(startTag));
    ignore partsIter.next();
    switch (partsIter.next()) {
      case (null) { null };
      case (?afterStart) {
        let innerIter = afterStart.split(#text(endTag));
        innerIter.next();
      };
    };
  };

  func extractAttr(text : Text, attr : Text) : ?Text {
    let search = attr # "=\"";
    let partsIter = text.split(#text(search));
    ignore partsIter.next();
    switch (partsIter.next()) {
      case (null) { null };
      case (?afterQuote) {
        let valueIter = afterQuote.split(#text("\""));
        valueIter.next();
      };
    };
  };

  func textFrom(text : Text, needle : Text) : ?Text {
    let partsIter = text.split(#text(needle));
    ignore partsIter.next();
    switch (partsIter.next()) {
      case (null) { null };
      case (?rest) { ?(needle # rest) };
    };
  };

  func parseVideos(xml : Text) : [Video] {
    var result : [Video] = [];
    let entriesIter = xml.split(#text("<entry>"));
    ignore entriesIter.next();

    for (chunk in entriesIter) {
      let entryParts = chunk.split(#text("</entry>"));
      switch (entryParts.next()) {
        case (null) {};
        case (?entry) {
          let videoId = switch (extractBetween(entry, "<yt:videoId>", "</yt:videoId>")) {
            case (null) { "" };
            case (?v) { v };
          };
          if (videoId != "") {
            let title = switch (extractBetween(entry, "<title>", "</title>")) {
              case (null) { "" };
              case (?v) { v };
            };
            let published = switch (extractBetween(entry, "<published>", "</published>")) {
              case (null) { "" };
              case (?v) { v };
            };
            let description = switch (extractBetween(entry, "<media:description>", "</media:description>")) {
              case (null) { "" };
              case (?v) { v };
            };
            let thumbnailUrl = switch (textFrom(entry, "<media:thumbnail")) {
              case (null) {
                "https://img.youtube.com/vi/" # videoId # "/hqdefault.jpg";
              };
              case (?thumbnailSection) {
                switch (extractAttr(thumbnailSection, "url")) {
                  case (null) {
                    "https://img.youtube.com/vi/" # videoId # "/hqdefault.jpg";
                  };
                  case (?url) { url };
                };
              };
            };

            result := result.concat([{
              id = videoId;
              youtubeVideoId = videoId;
              title;
              description;
              publishedAt = published;
              thumbnailUrl;
              createdAt = Time.now();
            }]);
          };
        };
      };
    };
    result;
  };

  public func syncFromYoutube() : async Text {
    try {
      let xml = await Outcall.httpGetRequest(YOUTUBE_RSS_URL, [], transform);
      let videos = parseVideos(xml);
      cachedVideos := videos;
      lastFetchTime := Time.now();
      "ok: fetched " # videos.size().toText() # " videos";
    } catch (e) {
      "error: " # e.message();
    };
  };

  public query func listVideos() : async [Video] {
    cachedVideos.sort(Video.compareByPublished);
  };

  public query func getLastFetchTime() : async Int {
    lastFetchTime;
  };
};
