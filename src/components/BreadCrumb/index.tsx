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
}
export default function BreadCrumb(props: Props) {
  const { crumbs } = props;
  return (
    <div className='bread-crumb-container'>
      {crumbs.map(({ text, link, onClick }, i) => (
        <span key={i}>
          {link ? <Link to={link}>{text}</Link> : onClick ? <a onClick={() => onClick()}>{text}</a> : <span className='text'>{text}</span>}
          {i < crumbs.length - 1 && <span className='text plr3'>/</span>}
        </span>
      ))}
    </div>
  );
}
