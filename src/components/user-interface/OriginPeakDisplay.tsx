/**
 * @file OriginPeakDisplay.tsx
 * @description Display component for Origin Peak with map background and typewriter animation
 */

import { useState, useEffect } from 'react';
import mapAsset from "../../assets/my_assets/mapAsset.png";

// Define the props interface
interface OriginPeakDisplayProps {
  title: string;
  tagline: string;
  bio: string;
}

const OriginPeakDisplay = ({ title, tagline, bio }: OriginPeakDisplayProps) => {
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [displayedTagline, setDisplayedTagline] = useState('');
  const [displayedBio, setDisplayedBio] = useState('');
  const [isTitleComplete, setIsTitleComplete] = useState(false);
  const [isTaglineComplete, setIsTaglineComplete] = useState(false);
  const [isBioComplete, setIsBioComplete] = useState(false);

  // Typewriter effect for title
  useEffect(() => {
    if (displayedTitle.length < title.length) {
      const timeout = setTimeout(() => {
        setDisplayedTitle(title.slice(0, displayedTitle.length + 1));
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      setIsTitleComplete(true);
    }
  }, [displayedTitle, title]);

  // Typewriter effect for tagline (starts after title completes)
  useEffect(() => {
    if (isTitleComplete && displayedTagline.length < tagline.length) {
      const timeout = setTimeout(() => {
        setDisplayedTagline(tagline.slice(0, displayedTagline.length + 1));
      }, 40);
      return () => clearTimeout(timeout);
    } else if (isTitleComplete && displayedTagline.length === tagline.length) {
      setIsTaglineComplete(true);
    }
  }, [isTitleComplete, displayedTagline, tagline]);

  // Typewriter effect for bio (starts after tagline completes)
  useEffect(() => {
    if (isTaglineComplete && displayedBio.length < bio.length) {
      const timeout = setTimeout(() => {
        setDisplayedBio(bio.slice(0, displayedBio.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (isTaglineComplete && displayedBio.length === bio.length) {
      setIsBioComplete(true);
    }
  }, [isTaglineComplete, displayedBio, bio]);

  // Reset animation when component mounts
  useEffect(() => {
    setDisplayedTitle('');
    setDisplayedTagline('');
    setDisplayedBio('');
    setIsTitleComplete(false);
    setIsTaglineComplete(false);
    setIsBioComplete(false);
  }, [title, tagline, bio]);

  // Skip animation function - instantly shows all text
  const skipAnimation = () => {
    setDisplayedTitle(title);
    setDisplayedTagline(tagline);
    setDisplayedBio(bio);
    setIsTitleComplete(true);
    setIsTaglineComplete(true);
    setIsBioComplete(true);
  };

  return (
    // Map as background with text on top - fixed containment, no scroll
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        backgroundImage: `url(${mapAsset})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '650px',
        width: '100%',
      }}
    >
      {/* Text content on top of the map - contained and readable */}
      <div className="relative z-10 p-6 left-32 top-24 md:p-10 max-w-md">
        <h3 className="mb-2 text-lg font-bold text-[#5c2e0e] drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]">
          {displayedTitle}
          {!isTitleComplete && (
            <span className="inline-block w-0.5 h-5 ml-1 bg-[#5c2e0e] animate-pulse" />
          )}
        </h3>
        <p className="mb-3 border-l-4 border-[#5c2e0e] pl-4 text-base italic leading-6 text-[#4a2208] drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]">
          {displayedTagline}
          {isTitleComplete && !isTaglineComplete && (
            <span className="inline-block w-0.5 h-5 ml-1 bg-[#4a2208] animate-pulse" />
          )}
        </p>
        <p className="text-sm leading-6 text-[#3d1b05] drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)] text-justify max-w-2xl">
          {displayedBio}
          {isTaglineComplete && !isBioComplete && (
            <span className="inline-block w-0.5 h-5 ml-1 bg-[#3d1b05] animate-pulse" />
          )}
        </p>
      </div>

      {/* Skip button - styled exactly like the Back button */}
      {(!isBioComplete || !isTaglineComplete || !isTitleComplete) && (
        <button
          onClick={skipAnimation}
          className="absolute bottom-0  right-0 z-20 flex w-fit items-center gap-2 rounded-lg border border-[rgba(255,210,122,0.4)] px-4 py-1.5 text-xs  uppercase tracking-[0.14em] text-[#fff0c7] backdrop-blur-sm transition hover:border-[#ffd27a] hover:bg-[rgba(255,210,122,0.12)]"
        >
          Skip 
        </button>
      )}
    </div>
  );
};

export default OriginPeakDisplay;