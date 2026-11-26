import { describe,it,expect,vi,afterEach } from 'vitest';
import { render,screen,waitFor,cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PetsaPage from './PetsaPage.jsx';
vi.mock('../firebase.js',()=>({db:{},storage:{}}));
vi.mock('firebase/firestore',()=>({collection:vi.fn(),addDoc:vi.fn(),orderBy:vi.fn(),query:vi.fn(),serverTimestamp:vi.fn(),getDocs:vi.fn(async()=>({forEach(){}}))}));
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
describe('Firestore album playback',()=>{
  it('shows a remote video as a video with its image thumbnail and playable cloud URL',async()=>{
    const video={type:'video',url:'https://example.test/video.mp4',thumbnailUrl:'https://example.test/poster.jpg'};
    vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({ok:true,albums:[{date:'2026-08-06',label:'Cloud album',place:'',desc:'',media:[video]}]})})));
    const user=userEvent.setup();
    const {container}=render(<MemoryRouter><PetsaPage/></MemoryRouter>);
    await user.click(await screen.findByRole('button',{name:/Cloud album/}));
    expect(screen.getByText('1 VIDEO')).toBeInTheDocument();
    const item=screen.getByRole('button',{name:'Video 1'});
    expect(item.querySelector('img')).toHaveAttribute('src',video.thumbnailUrl);
    await user.click(item);
    await waitFor(()=>expect(container.querySelector('video')).toHaveAttribute('src',video.url));
    expect(container.querySelector('video')).toHaveAttribute('poster',video.thumbnailUrl);
    expect(container.querySelector('video')).toHaveAttribute('controls');
  });
});
