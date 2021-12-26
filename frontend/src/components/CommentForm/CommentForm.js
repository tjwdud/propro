import Component from '../component';
import './commentForm.scss';
import axiosInstance from '../../utils/api';
// import Comments from '../../components/Comments/Comments';
import Comment from '../Comments/Comment';
import { state } from '../../utils/store';

export default class CommentForm extends Component {
  constructor(props) {
    super(props);
    this.$dom = this.createDom('form', {
      className: 'commentForm',
    });
    this.render();
    this.addEvent();
  }

  render = () => {
    this.$dom.innerHTML =
      this.props.userType === 'loggedUser' || this.props.userType === 'author'
        ? this.loggedUserForm()
        : this.notLoggedUserForm();
  };

  loggedUserForm = () => {
    return `          
        <textarea placeholder="댓글을 남겨주세요." class="writeComment" type="text" ></textarea>
        <input class="submitComment" type="submit" value="등록" />
    `;
  };

  notLoggedUserForm = () => {
    return `          
        <textarea readonly placeholder="먼저 로그인 해주세요." class="writeComment" type="text" ></textarea>
    `;
  };

  addEvent = () => {
    this.$dom.addEventListener('submit', this.postComment);
  };

  postComment = event => {
    event.preventDefault();
    const content = this.$dom.querySelector('.writeComment').value;
    const { parentType, postId } = this.props;
    console.log(content, parentType, postId);
    this.$dom.querySelector('.writeComment').value = '';
    axiosInstance.post(
      'comments',
      {
        content,
        parentType,
        parentId: postId,
      },
      { withCredentials: true },
    );
    this.paintComment(content);
  };

  paintComment = content => {
    const { parentType, postId, userId } = this.props;
    const userState = state.myInfo;
    const hr = document.createElement('hr');
    const newComment = new Comment({
      comment: {
        nestedComments: [],
        userId,
        author: {
          imageURL: userState.imageURL,
          nickname: userState.nickname,
        },
        updatedAt: '지금',
        _id: userState._id,
        parentId: postId,
        content,
      },
      userId,
      parentType,
    });

    if (parentType === 'post') {
      const commentContainer = this.$dom.previousSibling.previousSibling;
      commentContainer.appendChild(newComment.$dom);
      commentContainer.appendChild(hr);
    }
    if (parentType === 'comment') {
      const commentContainer =
        this.$dom.previousSibling.previousSibling.parentNode;
      this.$dom.parentNode.removeChild(this.$dom);
      commentContainer.parentNode.insertBefore(
        newComment.$dom,
        commentContainer.nextSibling,
      );
      commentContainer.parentNode.insertBefore(
        hr,
        commentContainer.nextSibling,
      );
    }
  };
}
