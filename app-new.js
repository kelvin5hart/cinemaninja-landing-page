/*
  CinemaNinja website – Modern React application
  Light/Dark theme with scrolling movie posters background
*/

const e = React.createElement;

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC1xc6dItrbJQSUquol_jc7sqfRces0ODU",
  authDomain: "cinema-ninja.firebaseapp.com",
  projectId: "cinema-ninja",
  storageBucket: "cinema-ninja.appspot.com",
  messagingSenderId: "1069558837780",
  appId: "1:1069558837780:android:a14ae582b6565a67b52d01"
};

// Initialize Firebase app
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Top Ninjas Component - fetches and displays top profiles from Firebase
// Split into two sections: Top by Recommendations and Top by Followers
function TopNinjas() {
  const [topByRecommendations, setTopByRecommendations] = React.useState([]);
  const [topByFollowers, setTopByFollowers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTopProfiles() {
      try {
        console.log('Starting to fetch top profiles...');
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get(); // Fetch ALL users

        console.log('Total users fetched:', snapshot.docs.length);

        const allProfiles = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            uid: doc.id,
            name: data.name || 'Unknown User',
            username: data.username || '',
            pictureUrl: data.pictureUrl || '',
            followers: data.followers || 0,
            recommendCount: data.recommendCount || 0,
            recommend: data.recommend || [],
            bio: data.bio || ''
          };
        });

        console.log('All profiles:', allProfiles);

        // Find the Admin Ninja profile specifically
        const adminNinja = allProfiles.find(p => p.name === 'Admin Ninja');
        console.log('Admin Ninja profile:', adminNinja);
        console.log('Admin Ninja recommendations:', adminNinja ? adminNinja.recommend.length : 'NOT FOUND');
        console.log('Admin Ninja followers:', adminNinja ? adminNinja.followers : 'NOT FOUND');

        // Find max recommendations
        const maxRecommendations = Math.max(...allProfiles.map(p => p.recommend.length));
        console.log('Max recommendations found:', maxRecommendations);
        console.log('Profile with max recommendations:', allProfiles.find(p => p.recommend.length === maxRecommendations));

        // Top by Recommendations - users with most recommendations (top 10)
        const byRecommendations = allProfiles
          .filter(profile => profile.recommend.length >= 1) // At least 1 recommendation
          .sort((a, b) => b.recommend.length - a.recommend.length)
          .slice(0, 10);

        // Top by Followers - most popular users (top 10)
        const byFollowers = allProfiles
          .filter(profile => profile.followers > 0) // At least 1 follower
          .sort((a, b) => b.followers - a.followers)
          .slice(0, 10);

        console.log('Top by recommendations:', byRecommendations);
        console.log('Recommendation counts:', byRecommendations.map(p => `${p.name}: ${p.recommend.length}`));
        console.log('Top by followers:', byFollowers);
        console.log('Follower counts:', byFollowers.map(p => `${p.name}: ${p.followers}`));

        setTopByRecommendations(byRecommendations);
        setTopByFollowers(byFollowers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching top profiles:', error);
        console.error('Error details:', error.message, error.code);
        setLoading(false);
      }
    }

    fetchTopProfiles();
  }, []);

  if (loading) {
    return e('section', { className: 'top-ninjas' },
      e('div', { className: 'top-ninjas-container' },
        e('h2', null, 'Top Community Members'),
        e('p', { className: 'section-subtitle' }, 'Meet our most influential movie enthusiasts'),
        e('div', { className: 'loading-spinner' }, 'Loading...')
      )
    );
  }

  if (topByRecommendations.length === 0 && topByFollowers.length === 0) {
    return null; // Hide section if no data
  }

  const formatFollowers = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const renderProfileCard = (profile, idx, highlightStat) => {
    return e('div', {
      key: profile.uid,
      className: 'ninja-card',
      style: { animationDelay: `${idx * 0.1}s` }
    },
      e('div', { className: 'ninja-rank' }, `#${idx + 1}`),
      e('div', { className: 'ninja-avatar' },
        profile.pictureUrl && !profile.pictureUrl.includes('default')
          ? e('img', { src: profile.pictureUrl, alt: profile.name })
          : e('div', { className: 'ninja-avatar-placeholder' },
              profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            )
      ),
      e('h3', { className: 'ninja-name' }, profile.name),
      profile.username && e('p', { className: 'ninja-username' }, `@${profile.username}`),
      profile.bio && e('p', { className: 'ninja-bio' }, profile.bio),
      e('div', { className: 'ninja-stats' },
        e('div', { className: 'ninja-stat' },
          e('span', {
            className: highlightStat === 'followers' ? 'stat-value stat-highlighted' : 'stat-value'
          }, formatFollowers(profile.followers)),
          e('span', { className: 'stat-label' }, 'Followers')
        ),
        e('div', { className: 'ninja-stat' },
          e('span', {
            className: highlightStat === 'recommendations' ? 'stat-value stat-highlighted' : 'stat-value'
          }, profile.recommend.length),
          e('span', { className: 'stat-label' }, 'Recommendations')
        )
      )
    );
  };

  return e('section', { className: 'top-ninjas' },
    e('div', { className: 'top-ninjas-container' },
      e('h2', null, 'Top Community Members'),
      e('p', { className: 'section-subtitle' }, 'Meet our most influential movie enthusiasts'),

      // Top by Recommendations Section
      topByRecommendations.length > 0 && e('div', { className: 'ninja-category' },
        e('h3', { className: 'ninja-category-title' },
          e('i', { className: 'fa-solid fa-star' }),
          ' Best Taste Makers'
        ),
        e('p', { className: 'ninja-category-subtitle' }, 'Users with the most movie recommendations'),
        e('div', { className: 'ninja-carousel-wrapper' },
          e('div', { className: 'ninja-carousel' },
            topByRecommendations.map((profile, idx) =>
              renderProfileCard(profile, idx, 'recommendations')
            )
          )
        )
      ),

      // Top by Followers Section
      topByFollowers.length > 0 && e('div', { className: 'ninja-category' },
        e('h3', { className: 'ninja-category-title' },
          e('i', { className: 'fa-solid fa-users' }),
          ' Most Popular'
        ),
        e('p', { className: 'ninja-category-subtitle' }, 'Users with the largest following'),
        e('div', { className: 'ninja-carousel-wrapper' },
          e('div', { className: 'ninja-carousel' },
            topByFollowers.map((profile, idx) =>
              renderProfileCard(profile, idx, 'followers')
            )
          )
        )
      )
    )
  );
}

// Feature definitions
const features = [
  {
    icon: 'fa-solid fa-wand-magic-sparkles',
    title: 'Smart Recommendations',
    desc: 'AI-powered suggestions tailored to your unique taste and viewing history.',
    color: '#f59e0b'
  },
  {
    icon: 'fa-solid fa-users',
    title: 'Vibrant Community',
    desc: 'Connect with fellow cinephiles, join clans, and share your passion.',
    color: '#8b5cf6'
  },
  {
    icon: 'fa-solid fa-trophy',
    title: 'Compete & Win',
    desc: 'Test your movie knowledge with trivia, climb leaderboards, earn badges.',
    color: '#ef4444'
  },
  {
    icon: 'fa-solid fa-star',
    title: 'Rate & Review',
    desc: 'Share your thoughts, rate films, and help others discover greatness.',
    color: '#3b82f6'
  },
  {
    icon: 'fa-solid fa-fire',
    title: 'Trending Content',
    desc: 'Stay updated with what\'s hot, viral memes, and community polls.',
    color: '#f97316'
  },
  {
    icon: 'fa-solid fa-map-marker-alt',
    title: 'Local Discovery',
    desc: 'Find what\'s popular in your area with location-based recommendations.',
    color: '#10b981'
  }
];

function App() {
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return e(React.Fragment, null,
    // Header with dark mode toggle
    e('header', null,
      e('div', { className: 'header-left' },
        e('img', {
          src: './assets/logo.png',
          alt: 'CinemaNinja logo',
          className: 'logo-image'
        }),
        e('span', { className: 'logo-text' }, 'CinemaNinja')
      ),
      e('div', { className: 'header-right' },
        e('button', {
          className: 'theme-toggle',
          onClick: toggleTheme,
          'aria-label': 'Toggle theme',
          title: theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'
        },
          e('i', {
            className: theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'
          })
        )
      )
    ),

    // Hero section with scrolling posters
    e('section', { className: 'hero' },
      // Scrolling posters background
      e('div', { className: 'posters-background' },
        // Row 1 - scrolling left to right (duplicate for seamless loop)
        e('div', { className: 'poster-row' },
          Array(24).fill(null).map((_, i) =>
            e('img', {
              key: `r1-${i}`,
              src: `./assets/posters/poster${(i % 12) + 1}.jpg`,
              alt: 'Movie poster'
            })
          )
        ),
        // Row 2 - scrolling right to left (duplicate for seamless loop)
        e('div', { className: 'poster-row' },
          Array(24).fill(null).map((_, i) =>
            e('img', {
              key: `r2-${i}`,
              src: `./assets/posters/poster${((i + 4) % 12) + 1}.jpg`,
              alt: 'Movie poster'
            })
          )
        ),
        // Row 3 - scrolling left to right (duplicate for seamless loop)
        e('div', { className: 'poster-row' },
          Array(24).fill(null).map((_, i) =>
            e('img', {
              key: `r3-${i}`,
              src: `./assets/posters/poster${((i + 8) % 12) + 1}.jpg`,
              alt: 'Movie poster'
            })
          )
        )
      ),

      e('div', { className: 'hero-content' },
        e('div', { className: 'hero-text' },
          e('img', { src: './assets/logo.png', alt: 'CinemaNinja Logo', className: 'hero-logo fade-in-up' }),
          e('h2', { className: 'hero-tagline fade-in-up delay-1' },
            'Prove You Have ',
            e('span', { className: 'tagline-highlight' }, 'Great Taste'),
            ' in Movies'
          ),
          e('p', { className: 'hero-description fade-in-up delay-2' },
            'Rate films. Gain followers. Build your movie clan. Compete in trivia. Become the ultimate ',
            e('strong', { className: 'ninja-text' }, 'CinemaNinja'),
            ' and let your taste do the talking.'
          ),
          e('p', { className: 'hero-cta fade-in-up delay-3' },
            e('span', { className: 'cta-arrow' }, '👇'),
            ' Download Now & Start Your Journey'
          ),
          e('div', { className: 'buttons-container fade-in-up delay-4', id: 'download' },
            e('a', {
              href: 'https://apps.apple.com/app/id1612017004',
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'store-badge'
            },
              e('img', {
                src: './assets/app-store-badge.svg',
                alt: 'Download on the App Store'
              })
            ),
            e('a', {
              href: 'https://play.google.com/store/apps/details?id=com.kahstudios.cinema_ninja',
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'store-badge'
            },
              e('img', {
                src: './assets/google-play-badge.png',
                alt: 'Get it on Google Play'
              })
            )
          ),
          e('p', { className: 'hero-subtext fade-in-up delay-5' },
            '✓ Free to Download  •  ✓ No Subscriptions  •  ✓ 4.5★ Rating'
          )
        ),

        // Animated phone mockup with screenshots
        e('div', { className: 'phone-mockup' },
          e('div', { className: 'phone-frame' },
            e('div', { className: 'phone-screen' },
              e('div', { className: 'screenshot-carousel' },
                e('img', {
                  src: './assets/screenshot_1.jpg',
                  alt: 'App Screenshot 1',
                  className: 'screenshot active'
                }),
                e('img', {
                  src: './assets/screenshot_2.PNG',
                  alt: 'App Screenshot 2',
                  className: 'screenshot'
                }),
                e('img', {
                  src: './assets/screenshot_3.jpg',
                  alt: 'App Screenshot 3',
                  className: 'screenshot'
                })
              ),
              e('div', { className: 'carousel-dots' },
                e('span', { className: 'dot active', 'data-index': '0' }),
                e('span', { className: 'dot', 'data-index': '1' }),
                e('span', { className: 'dot', 'data-index': '2' })
              )
            ),
            e('div', { className: 'phone-notch' })
          )
        )
      )
    ),

    // How It Works section
    e('section', { className: 'how-it-works' },
      e('div', { className: 'how-it-works-container' },
        e('h2', null, 'Get Started in 60 Seconds'),
        e('div', { className: 'steps-grid' },
          e('div', { className: 'step' },
            e('div', { className: 'step-number' }, '1'),
            e('div', { className: 'step-icon' }, '📱'),
            e('h3', null, 'Download & Sign Up'),
            e('p', null, 'Free account in 30 seconds. No credit card needed.')
          ),
          e('div', { className: 'step' },
            e('div', { className: 'step-number' }, '2'),
            e('div', { className: 'step-icon' }, '⭐'),
            e('h3', null, 'Rate 10 Movies'),
            e('p', null, 'Tell us what you love so we can personalize your experience.')
          ),
          e('div', { className: 'step' },
            e('div', { className: 'step-number' }, '3'),
            e('div', { className: 'step-icon' }, '🎯'),
            e('h3', null, 'Get Instant Recommendations'),
            e('p', null, 'Discover hidden gems matched to your unique taste.')
          ),
          e('div', { className: 'step' },
            e('div', { className: 'step-number' }, '4'),
            e('div', { className: 'step-icon' }, '🏆'),
            e('h3', null, 'Join Clans & Compete'),
            e('p', null, 'Connect with fans, play trivia, and climb leaderboards.')
          )
        )
      )
    ),

    // Stats section
    e('section', { className: 'stats-section' },
      e('div', { className: 'stats-container' },
        e('div', { className: 'stat-card' },
          e('div', { className: 'stat-icon' }, '👥'),
          e('div', { className: 'stat-number' }, '1,500+'),
          e('div', { className: 'stat-label' }, 'Active Users')
        ),
        e('div', { className: 'stat-card' },
          e('div', { className: 'stat-icon' }, '⭐'),
          e('div', { className: 'stat-number' }, '4.5'),
          e('div', { className: 'stat-label' }, 'App Store Rating')
        ),
        e('div', { className: 'stat-card' },
          e('div', { className: 'stat-icon' }, '🎬'),
          e('div', { className: 'stat-number' }, '1,000+'),
          e('div', { className: 'stat-label' }, 'Movies Rated')
        ),
        e('div', { className: 'stat-card' },
          e('div', { className: 'stat-icon' }, '🌍'),
          e('div', { className: 'stat-number' }, '10+'),
          e('div', { className: 'stat-label' }, 'Countries')
        )
      )
    ),

    // Features section - redesigned as cards with icons
    e('section', { className: 'features-modern', id: 'features' },
      e('div', { className: 'features-header' },
        e('h2', null, 'Everything You Need to Love Movies More'),
        e('p', null, 'Powerful features designed for true movie enthusiasts')
      ),
      e('div', { className: 'features-grid-modern' },
        features.map((f, idx) =>
          e('div', {
            key: idx,
            className: 'feature-card-modern',
            style: { animationDelay: `${idx * 0.1}s` }
          },
            e('div', {
              className: 'feature-icon-modern',
              style: { color: f.color }
            },
              e('i', { className: f.icon })
            ),
            e('h3', { className: 'feature-title-modern' }, f.title),
            e('p', { className: 'feature-desc-modern' }, f.desc)
          )
        )
      )
    ),

    // Top Ninjas section
    e(TopNinjas),

    // Testimonials section
    e('section', { className: 'testimonials' },
      e('div', { className: 'testimonials-container' },
        e('h2', null, 'Loved by Movie Enthusiasts Worldwide'),
        e('div', { className: 'testimonials-scroll-wrapper' },
          e('div', { className: 'testimonials-scroll' },
            // First set
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"Finally found my film tribe! The clan feature is fire 🔥"'),
              e('div', { className: 'author-name' }, 'Sarah M. • New York')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"Nollywood section is top tier! Found so many classics I missed"'),
              e('div', { className: 'author-name' }, 'Chidi A. • Abuja')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"Better recommendations than Netflix, no cap"'),
              e('div', { className: 'author-name' }, 'James K. • London')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"Trivia nights with my clan go crazy! We rep Nollywood hard"'),
              e('div', { className: 'author-name' }, 'Blessing O. • Lagos')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"I\'ve watched more movies in 2 months than all year. Addicted!"'),
              e('div', { className: 'author-name' }, 'Maria G. • Toronto')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"As a Naija babe, seeing our movies featured properly hits different ❤️"'),
              e('div', { className: 'author-name' }, 'Temitope O. • Lagos')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"The ratings are actually honest. Found some hidden gems!"'),
              e('div', { className: 'author-name' }, 'David L. • Sydney')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"My guy, this app sweet die! African cinema dey shine here"'),
              e('div', { className: 'author-name' }, 'Kunle F. • Ibadan')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"Love how global it is. Found Bollywood fans who also love Nollywood"'),
              e('div', { className: 'author-name' }, 'Aisha M. • Port Harcourt')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"UI is clean, features are solid. Actually worth the hype"'),
              e('div', { className: 'author-name' }, 'Mike C. • Chicago')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"Been showing all my friends. We got a whole Lagos clan now 💪"'),
              e('div', { className: 'author-name' }, 'Funmi D. • Lagos')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"Finally, someone made an app for real movie lovers!"'),
              e('div', { className: 'author-name' }, 'Alex P. • Berlin')
            ),
            // Duplicate for seamless loop
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"Finally found my film tribe! The clan feature is fire 🔥"'),
              e('div', { className: 'author-name' }, 'Sarah M. • New York')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"Nollywood section is top tier! Found so many classics I missed"'),
              e('div', { className: 'author-name' }, 'Chidi A. • Abuja')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"Better recommendations than Netflix, no cap"'),
              e('div', { className: 'author-name' }, 'James K. • London')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"Trivia nights with my clan go crazy! We rep Nollywood hard"'),
              e('div', { className: 'author-name' }, 'Blessing O. • Lagos')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"I\'ve watched more movies in 2 months than all year. Addicted!"'),
              e('div', { className: 'author-name' }, 'Maria G. • Toronto')
            ),
            e('div', { className: 'testimonial-card' },
              e('div', { className: 'stars' }, '⭐⭐⭐⭐'),
              e('p', { className: 'testimonial-text' }, '"As a Naija babe, seeing our movies featured properly hits different ❤️"'),
              e('div', { className: 'author-name' }, 'Temitope O. • Lagos')
            )
          )
        )
      )
    ),

    // FAQ section
    e('section', { className: 'faq-section' },
      e('div', { className: 'faq-container' },
        e('h2', null, 'Frequently Asked Questions'),
        e('div', { className: 'faq-grid' },
          e('div', { className: 'faq-item' },
            e('h3', null, 'Is CinemaNinja really free?'),
            e('p', null, 'Yes! Free to download and use. The app is supported by ads, but there are no subscriptions, paywalls, or hidden fees. All features are accessible to everyone.')
          ),
          e('div', { className: 'faq-item' },
            e('h3', null, 'How is this different from IMDb or Letterboxd?'),
            e('p', null, 'CinemaNinja is the only platform focused on community and competition. Join clans, play trivia, compete on leaderboards - it\'s social networking meets movie discovery.')
          ),
          e('div', { className: 'faq-item' },
            e('h3', null, 'Can I import my ratings from other apps?'),
            e('p', null, 'Currently working on import features! For now, rating your favorite movies takes just a few minutes and helps us personalize your feed.')
          ),
          e('div', { className: 'faq-item' },
            e('h3', null, 'What are clans?'),
            e('p', null, 'Clans are themed communities (Horror Fanatics, Sci-Fi Geeks, Rom-Com Lovers, etc.) where you can chat, share recommendations, and compete in group challenges.')
          ),
          e('div', { className: 'faq-item' },
            e('h3', null, 'Is my data private?'),
            e('p', null, 'Absolutely. We never sell your data. Your ratings and activity are only used to improve your recommendations and clan experience.')
          ),
          e('div', { className: 'faq-item' },
            e('h3', null, 'What devices does it work on?'),
            e('p', null, 'Available on iOS and Android. Download from the App Store or Google Play Store.')
          )
        )
      )
    ),

    // CTA section
    e('section', { className: 'cta-modern' },
      e('div', { className: 'cta-container' },
        e('h2', null, 'Join 1,500+ Movie Lovers Who Already Know'),
        e('p', null, 'Download now and discover why CinemaNinja is the app movie fans have been waiting for.'),
        e('div', { className: 'cta-benefits' },
          e('div', { className: 'benefit' }, '✓ Free to download'),
          e('div', { className: 'benefit' }, '✓ No subscriptions or paywalls'),
          e('div', { className: 'benefit' }, '✓ All features unlocked')
        ),
        e('div', { className: 'buttons-container' },
          e('a', {
            href: 'https://apps.apple.com/app/id1612017004',
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'store-badge'
          },
            e('img', {
              src: './assets/app-store-badge.svg',
              alt: 'Download on the App Store'
            })
          ),
          e('a', {
            href: 'https://play.google.com/store/apps/details?id=com.kahstudios.cinema_ninja',
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'store-badge'
          },
            e('img', {
              src: './assets/google-play-badge.png',
              alt: 'Get it on Google Play'
            })
          )
        )
      )
    ),

    // Footer
    e('footer', { className: 'footer' },
      e('div', { className: 'footer-content' },
        e('p', null, `© ${new Date().getFullYear()} CinemaNinja. All rights reserved.`),
        e('div', { className: 'footer-links' },
          e('a', { href: '/terms.html', className: 'footer-link' }, 'Terms & Conditions'),
          e('span', { className: 'footer-separator' }, '•'),
          e('a', { href: '/privacy.html', className: 'footer-link' }, 'Privacy Policy'),
          e('span', { className: 'footer-separator' }, '•'),
          e('a', { href: 'mailto:cinemaninja@kahstudios.com', className: 'footer-link' }, 'Contact')
        )
      ),
      e('p', { style: { marginTop: '0.5rem' } }, 'Made with ❤️ for movie lovers.')
    )
  );
}

// Render the application
ReactDOM.render(e(App), document.getElementById('root'));

// Screenshot carousel functionality
setTimeout(() => {
  let currentSlide = 0;
  const screenshots = document.querySelectorAll('.screenshot');
  const dots = document.querySelectorAll('.carousel-dots .dot');

  function showSlide(index) {
    screenshots.forEach((screenshot, i) => {
      screenshot.classList.remove('active');
      if (i === index) {
        screenshot.classList.add('active');
      }
    });

    dots.forEach((dot, i) => {
      dot.classList.remove('active');
      if (i === index) {
        dot.classList.add('active');
      }
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % screenshots.length;
    showSlide(currentSlide);
  }

  setInterval(nextSlide, 3000);

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentSlide = index;
      showSlide(currentSlide);
    });
  });

  // Intersection Observer for feature cards
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.feature-card-modern').forEach(card => {
    observer.observe(card);
  });
}, 100);
