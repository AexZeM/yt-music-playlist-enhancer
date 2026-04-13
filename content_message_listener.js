// standalone fallback listener — only injected when main content script hasnt loaded yet
// in normal flow MessageBridge in content.js handles all of this
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'GET_TRACKS') return;

  // full tagger is running, use it
  if (typeof PlaylistProcessor !== 'undefined') {
    const tracks = PlaylistProcessor.extractTracks();
    const titleEl = document.querySelector('ytmusic-responsive-header-renderer yt-formatted-string.title');
    const playlistTitle = titleEl?.innerText?.trim() || document.title || 'My Playlist';
    sendResponse({ tracks, playlistTitle });
    return true;
  }

  // tagger not ready, scrape what we can from the DOM directly
  const shelf = document.querySelector('ytmusic-playlist-shelf-renderer')
             || document.querySelector('ytmusic-browse-response')
             || document.body;
  const rows  = Array.from(shelf.querySelectorAll('ytmusic-responsive-list-item-renderer'));
  const tracks = rows.filter(el => {
    const t = el.querySelector('.title');
    return t && t.innerText.trim().length > 0;
  }).map((el, idx) => {
    const titleEl    = el.querySelector('.title');
    const artistEls  = el.querySelectorAll('.flex-column yt-formatted-string');
    const durationEl = el.querySelector('.fixed-columns yt-formatted-string, .duration');
    return {
      idx,
      element:   el,
      rawTitle:  titleEl?.innerText?.trim()     || '',
      rawArtist: artistEls[0]?.innerText?.trim() || '',
      duration:  durationEl?.innerText?.trim()   || '',
      thumb:     el.querySelector('img#img')?.src || '',
    };
  });

  const titleEl = document.querySelector('ytmusic-responsive-header-renderer yt-formatted-string.title');
  const playlistTitle = titleEl?.innerText?.trim() || document.title || 'My Playlist';
  sendResponse({ tracks, playlistTitle });
  return true;
});