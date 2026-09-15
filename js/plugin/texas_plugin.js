const formatTemplates = {
    audiobook: `
      <iframe
        width="900"
        height="520"
        src="https://www.youtube-nocookie.com/embed/b_TCfRGj_lI"
        title="A Fragging in Texas ✿ Narrated by Xalsier"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        style="width:100%;max-width:900px;">
      </iframe>`,
      
    visualnovel: `
      <iframe
        frameborder="0"
        src="https://itch.io/embed-upload/19118148?color=000000"
        allowfullscreen
        width="900"
        height="520"
        style="width:100%;max-width:900px;">
        <a href="https://xalsier.itch.io/a-fragging-in-texas">Play A Fragging in Texas on itch.io</a>
      </iframe>
      <br>
      <center style="padding:20px;text-align:center;opacity:0.5;">
        (Note, if a 429 error occurs due to too many people playing the game at once, try one of the below links)
      </center>
      <center>
        ✿ <a href="https://xalsier.itch.io/a-fragging-in-texas">Itch.io</a>
        ✿ <a href="https://www.newgrounds.com/portal/view/1049962">Newgrounds</a>
        ✿ <a href="https://play.unity.com/en/games/44dd674e-3340-44eb-9ca2-6f51e81b55a8/webglmedaldebug2">Unity Play</a> ✿
      </center>`,
  
    shortstory: `
      <div style="padding:40px 20px;text-align:center;">
        <p>
          ✿ <a href="https://www.furaffinity.net/view/64039266/">Fur Affinity</a>
          ✿ <a href="https://www.pixiv.net/novel/show.php?id=28638645">Pixiv</a>
          ✿ <a href="https://substack.com/home/post/p-208105623">Substack</a> ✿
        </p><br>
        <p>
          ✿ <a href="https://archiveofourown.org/works/91380881">AO3</a>
          ✿ <a href="https://sofurry.com/s/e5RRqNAm">SoFurry</a>
          ✿ <a href="https://www.deviantart.com/xalsier/art/A-Fragging-in-Texas-1300148731">DeviantArt</a> ✿
        </p><br>
        <p>
          ✿ <a href="https://www.weasyl.com/~xalsier/submissions/2614721/a-fragging-in-texas">Weasyl</a>
          ✿ <a href="https://www.tumblr.com/xalsier/827185351810498560/a-fragging-in-texas">Tumblr</a>
          ✿ <a href="https://bsky.app/profile/xalsier.com/post/3mvk5hzzdmk2e">Bluesky Thread</a> ✿
        </p>
      </div>`,
  
    book: `
      <div style="padding:40px 20px;text-align:center;">
        <center><a href="https://www.goodreads.com/book/show/255582193"><img src="./thumb/goodreads_thumb.png"></a></center>
        <br>
        <p>
          ✿ <a href="https://www.amazon.com/dp/B0H9C2BNC7">Kindle</a>
          ✿ <a href="https://play.google.com/store/books/details?id=qpv1EQAAQBAJ">Google Play</a> ✿
        </p>
      </div>`
  };
  
  function showFormat(format) {
    const container = document.getElementById("media-container");
    if (!container || !formatTemplates[format]) return;
    container.innerHTML = formatTemplates[format];
    document.querySelectorAll(".texas-btn").forEach(button => {
      button.classList.remove("active");
      button.classList.add("inactive");
    });
    const activeBtn = document.getElementById("button-" + format);
    if (activeBtn) {
      activeBtn.classList.remove("inactive");
      activeBtn.classList.add("active");
    }
  }