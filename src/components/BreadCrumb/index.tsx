import React from 'react';
import { Link } from 'react-router-dom';
import './index.less';

interface Crumb {
  text: string;
  link?: string;
  onClick?: Function;
}

interface Props {
  crumbs: Crumb[];
  size?: 'default' | 'large';
}
export default function BreadCrumb(props: Props) {
  const { crumbs, size } = props;
  return (
    <div
      className='bread-crumb-container'
      style={{
        fontSize: size === 'large' ? '14px' : '12px',
      }}
    >
      {crumbs.map(({ text, link, onClick }, i) => (
        <span key={i}>
          {link ? <Link to={link}>{text}</Link> : onClick ? <a onClick={() => onClick()}>{text}</a> : <span className='text'>{text}</span>}
          {i < crumbs.length - 1 && (
            <span
              className='text plr3'
              style={{
                padding: size === 'large' ? '0 8px' : '0 3px',
              }}
            >
              /
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
