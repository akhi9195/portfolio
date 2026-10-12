import { useState } from 'react';
import { profile } from '../../data/profile';

export default function Avatar({ size = 96 }: { size?: number }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };
  if (failed) {
    return (
      <div
        style={style}
        className="grid place-items-center rounded-full bg-gradient-to-br from-mint-500 to-indigo-500 font-mono font-semibold text-ink-950"
        aria-label={profile.name}
        role="img"
      >
        <span style={{ fontSize: size * 0.34 }}>{profile.initials}</span>
      </div>
    );
  }
  return (
    <img
      src={profile.avatar}
      alt={profile.name}
      width={size}
      height={size}
      style={style}
      className="rounded-full object-cover ring-2 ring-mint-400/50"
      onError={() => setFailed(true)}
    />
  );
}
