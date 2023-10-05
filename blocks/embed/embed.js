/*
 * Embed Block
 * Show videos and social posts directly on your page
 * https://www.hlx.live/developer/block-collection/embed
 */
const loadScript = (url, callback, type) => {
	const head = document.querySelector('head');
	const script = document.createElement('script');
	script.src = url;
	if (type) {
	  script.setAttribute('type', type);
	}
	script.onload = callback;
	head.append(script);
	return script;
  };
  
  const getDefaultEmbed = (url) => `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
	  <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
		scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
	  </iframe>
	</div>`;
  
  const embedYoutube = (url, autoplay) => {
	const usp = new URLSearchParams(url.search);
	const suffix = autoplay ? '&muted=1&autoplay=1' : '';
	let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
	const embed = url.pathname;
	if (url.origin.includes('youtu.be')) {
	  [, vid] = url.pathname.split('/');
	}
	const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
		<iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
		allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
	  </div>`;
	return embedHTML;
  };
  
  const embedVimeo = (url, autoplay) => {
	const [, video] = url.pathname.split('/');
	const suffix = autoplay ? '?muted=1&autoplay=1' : '';
	const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
		<iframe src="https://player.vimeo.com/video/${video}${suffix}" 
		style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
		frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen  
		title="Content from Vimeo" loading="lazy"></iframe>
	  </div>`;
	return embedHTML;
  };
  
  const embedTwitter = (url) => {
	const embedHTML = `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
	loadScript('https://platform.twitter.com/widgets.js');
	return embedHTML;
  };

  const embedInstagram = (url, options) => {	
	const embedHTML = `<blockquote class="instagram-media" ${options ? 'data-instgrm-captioned' : ''} data-instgrm-permalink="${url.href}" data-instgrm-version="14"></blockquote>`;
	loadScript('https://www.instagram.com/embed.js');
	return embedHTML;
  };
  
  const loadEmbed = (block, link, options) => {
	
	if (block.classList.contains('embed-is-loaded')) {
	  return;
	}

	const EMBEDS_CONFIG = [
	  {
		match: ['youtube', 'youtu.be'],
		embed: embedYoutube,
	  },
	  {
		match: ['vimeo'],
		embed: embedVimeo,
	  },
	  {
		match: ['twitter'],
		embed: embedTwitter,
	  },
	  {
		match: ['instagram'],
		embed: embedInstagram,
	  },
	];
  
	const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
	const url = new URL(link);
	if (config) {
	  block.innerHTML = config.embed(url, options);
	  block.classList = `block embed embed-${config.match[0]}`;
	} else {
	  block.innerHTML = getDefaultEmbed(url);
	  block.classList = 'block embed';
	}
	block.classList.add('embed-is-loaded');
  };
  
  const instagramObjects = [];
  export default function decorate(block) {
	const placeholder = block.querySelector('picture');
	const link = block.querySelector('a').href;
	const instagramLink = link.includes('instagram');
	block.textContent = '';
  
	if (placeholder && !instagramLink) {
	  const wrapper = document.createElement('div');
	  wrapper.className = 'embed-placeholder';
	  wrapper.innerHTML = '<div class="embed-placeholder-play"><button title="Play"></button></div>';
	  wrapper.prepend(placeholder);
	  wrapper.addEventListener('click', () => {
		loadEmbed(block, link, true);
	  });
	  block.append(wrapper);
	} else if (instagramLink) {
		const caption = block.classList.contains('captions');
    	instagramObjects.push({ instBlock: block, instLink: link, instCaption: caption });

		if (placeholder) {
			const wrapper = document.createElement('div');
			wrapper.className = 'embed-placeholder';
			wrapper.innerHTML = '<div class="embed-placeholder-play"></div>';
			wrapper.prepend(placeholder);
			block.append(wrapper);
		}
	} else { 
		 const observer = new IntersectionObserver((entries) => {
		 const instaCaption = block.classList.contains('captions');
		  if (entries.some((e) => e.isIntersecting)) {
		  observer.disconnect();
		  loadEmbed(block, link, instaCaption);
		}
	  }, 
	  {
		rootMargin: `${window.innerHeight * 2}px 0px`
	  });
	  observer.observe(block);
	}
  }

  export function instagramDelay() {
	  instagramObjects.forEach((instagramInfo) => {
	  console.log('insta', instagramInfo);
	  loadEmbed(instagramInfo.instBlock, instagramInfo.instLink, instagramInfo.instCaption);
	});
  }
