import React, { useEffect, useState, Fragment } from 'react';
import { invoke, requestJira } from '@forge/bridge';

// Atlaskit
import LoadingButton from '@atlaskit/button/loading-button';   
import { Checkbox } from '@atlaskit/checkbox';
import EditorCloseIcon from '@atlaskit/icon/glyph/editor/close';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import Textfield from '@atlaskit/textfield';
import Lozenge from '@atlaskit/lozenge';
import Spinner from '@atlaskit/spinner';
import Button from '@atlaskit/button';

import Comment, {
  CommentAction,
  CommentAuthor,
  CommentEdited,
  CommentTime,
} from '@atlaskit/comment';
import Avatar from '@atlaskit/avatar';

// Custom Styles
import {
  Card, Row, Icon, IconContainer, Status, SummaryActions, SummaryCount, SummaryFooter,
  ScrollContainer, Form, LoadingContainer
} from './Styles';

function App() {
  const [todos, setTodos] = useState(null);
  const [input, setInput] = useState('');
  const [defaultInput, setDefaultInput] = useState('');
  const [isFetched, setIsFetched] = useState(false);
  const [isDeleteAllShowing, setDeleteAllShowing] = useState(false);
  const [isDeletingAll, setDeletingAll] = useState(false);
  const [issueId, setIssueId] = useState('');
  const [comments, setComments] = useState([]);
  const [formVisibleIndex, setFormVisibleIndex] = useState(-1);
  const [visibleForm, setVisibleForm] = useState(false);

  // useEffect(() => {
  //   view.getContext().then(setissueContext)
  //   console.log("issueContext: ", JSON.stringify(issuecontext));
  //   const issueId = issuecontext?.extension?.issue?.id;
  //   invoke('issueId', { id: issueId });
  //   if (issueId) {
  //     requestJira(`/rest/api/3/issue/${issueId}/comment`, {
  //       headers: {
  //         'Accept': 'application/json'
  //       }
  //     })
  //     .then((response) => response.json())
  //     .then((response) => setComment(response.comments))
  //   }
  // }, []); 

  useEffect(() => {
    if (issueId !== '' || issueId) {
      requestJira(`/rest/api/3/issue/${issueId}/comment`, {
        headers: {
          'Accept': 'application/json'
        }
      })
      .then((response) => response.json())
      .then((response) => {
        function compareByDate(a, b) {
          const dateA = new Date(a.updated);
          const dateB = new Date(b.updated);
          return dateB - dateA;
        }

        const newComments = response.comments;
        newComments.sort(compareByDate)
        
        setComments(newComments);
        setVisibleForm(true);
        // invoke('debug', {data: JSON.stringify(response.comments)});
      })
    }
  }, [issueId]);

  const initFormVisbleIndex = () =>{
    // invoke('debug', {data:`init visible`})
    setInput('');
    setFormVisibleIndex(-1);
  }

  const getIssueId = async () => {
    await invoke('get-all').then(setTodos);
    await invoke('get-issueId').then((e) => {
      setIssueId(e[0]);
      // invoke('debug', {data: e[0]});
    });
  }

  if (!isFetched) {
    setIsFetched(true);
    getIssueId();
  }

  const createTodo = async (label) => {
    const newTodoList = [...todos, { label, isChecked: false, isSaving: true }];

    setTodos(newTodoList);
  }

  const createDefaultComment = async (label) => {
    var bodyData = {
      "body": {
        "content": [
          {
            "content": [
              {
                "text": label,
                "type": "text"
              }
            ],
            "type": "paragraph"
          }
        ],
        "type": "doc",
        "version": 1
      }
    };

    // invoke('debug', {data: `DefaultComment: ${issueId}`});
  
    requestJira(`/rest/api/3/issue/${issueId}/comment`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    })
    .then((response) => response.json())
    .then((response) => {
      // invoke('debug', {data:`response: ${JSON.stringify(response)}`});
      setComments([response, ...comments]);
    })
  }

  const createComment = async (label, parentId) => {
    
    invoke('debug', {data: `Parent Id: ${parentId}`});
    var bodyData = {
      "body": {
        "content": [
          {
            "content": [
              {
                "text": label,
                "type": "text"
              }
            ],
            "type": "paragraph"
          },
          {
            "content": [
              {
                "text": "",
                "type": "text"
              }
            ],
            "type": "paragraph"
          },
          {
            "content": [
              {
                "text": `Replied to: ${parentId}`,
                "type": "text"
              }
            ],
            "type": "paragraph"
          }
        ],
        "type": "doc",
        "version": 1,
      }
    };
  
    requestJira(`/rest/api/3/issue/${issueId}/comment`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    })
    .then((response) => response.json())
    .then((response) => {
      // invoke('debug', {data:`response: ${JSON.stringify(response)}`});
      setComments([response, ...comments]);
    })
  }

  const toggleTodo = (id) => {
    setTodos(
      todos.map(todo => {
        if (todo.id === id) {
          return { ...todo, isChecked: !todo.isChecked, isSaving: true };
        }
        return todo;
      })
    )
  }

  const deleteTodo = (id) => {
    setTodos(
      todos.map(todo => {
        if (todo.id === id) {
          return { ...todo, isDeleting: true };
        }
        return todo;
      })
    )
  }

  const deleteAllTodos = async () => {
    setDeletingAll(true);

    await invoke('delete-all');

    setTodos([]);
    setDeleteAllShowing(false);
    setDeletingAll(false);
  }

  const onSubmit = (e, parent) => {
    e.preventDefault();
    createComment(input, parent);
    initFormVisbleIndex();
  };

  const onDefaultSubmit = (e) => {
    // invoke('debug', {data: `Default Submit ok`});
    e.preventDefault();
    createDefaultComment(defaultInput);    
    setDefaultInput('');
  };

  // useEffect(() => {
  //   if (!todos) return;
  //   if (!todos.find(todo => todo.isSaving || todo.isDeleting)) return;

  //   Promise.all(
  //     todos.map((todo) => {
  //       if (todo.isSaving && !todo.id) {
  //         return invoke('create', { label: todo.label, isChecked: false })
  //       }
  //       if (todo.isSaving && todo.id) {
  //         return invoke('update', { id: todo.id, label: todo.label, isChecked: todo.isChecked })
  //       }
  //       if (todo.isDeleting && todo.id) {
  //         return invoke('delete', { id: todo.id }).then(() => false);
  //       }
  //       return todo;
  //     })
  //   )
  //   .then(saved => saved.filter(a => a))
  //   .then(setTodos)
  // }, [todos]);

  // if (!comments) {
  //   return (
  //     <Card>
  //       <LoadingContainer>
  //         <Spinner size="large" />
  //       </LoadingContainer>
  //     </Card>
  //   );
  // }

  // const completedCount = todos.filter(todo => todo.isChecked).length;
  // const totalCount = todos.length;

  const displayContents = (contents) => {
    // invoke('debug', {data: JSON.stringify(contents)}); 
    return(
      contents.map((contentchild, i) => {
        // invoke('debug', {data: JSON.stringify(contentchild)})
        return <p key={`content-${i}`}>{contentchild?.content[0]?.text}</p>
  })
    )
  }

  const handleReply = (index) => {
    // invoke('debug', {data: `Index - ${index}`})
    setInput('');
    setFormVisibleIndex(index);
  }

  const DeleteAll = () => isDeleteAllShowing ? (
    <LoadingButton
      appearance="danger"
      spacing="compact"
      isLoading={isDeletingAll}
      isDisabled={isDeletingAll}
      onClick={deleteAllTodos}
    >
      Delete All
    </LoadingButton>
  ) : (
    <LoadingButton appearance="subtle" spacing="none" onClick={() => setDeleteAllShowing(true)}>
      <IconContainer>
        <Icon>
          <TrashIcon />
        </Icon>
      </IconContainer>
    </LoadingButton>
  );

  const CompletedLozenge = () => <Lozenge>{completedCount}/{totalCount} Completed</Lozenge>;

  return (
    <>
      <ScrollContainer>
        {/* {todos.map(({ id, label, isChecked, isSaving, isDeleting }, i) => {
          const isSpinnerShowing = isSaving || isDeleting;

          return (
            <Row isChecked={isChecked} key={label}>
              <Checkbox isChecked={isChecked} label={label} name={label} onChange={() => toggleTodo(id)} />
              <Status>
                {isSpinnerShowing ? <Spinner size="medium" /> : null}
                {isChecked ? <Lozenge appearance="success">Done</Lozenge> : null}
                <Button size="small" spacing="none" onClick={() => deleteTodo(id)}>
                  <IconContainer>
                    <Icon>
                      <EditorCloseIcon />
                    </Icon>
                  </IconContainer>
                </Button>
              </Status>
            </Row>
          );
        })} */}

        {visibleForm && 
        <Form onSubmit={onDefaultSubmit}>
          <Textfield
            placeholder="Add a comment ..."
            value={defaultInput}
            onChange={({ target }) => setDefaultInput(target.value)}
            elemAfterInput = {
              <Button 
                appearance="subtle-link" 
                onClick = {initFormVisbleIndex} 
                // iconBefore={<EditorCloseIcon/>}
              />
            }
          />
        </Form>}

        {comments?.map((comment) => {
          // invoke('debug', {data: `${i}-${JSON.stringify(comment)}`});
          const i = comment.id
          return (
            <Fragment key={`row-${i}`}>
              <Row>
                <Comment
                  avatar={<Avatar name={comment?.author?.displayName} src={"https://secure.gravatar.com/avatar/c493d292129358359434600f707b3e6f?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FC-2.png"} />}
                  author={<CommentAuthor>{comment?.author?.displayName}</CommentAuthor>}
                  // type="author"
                  // edited={<CommentEdited>Edited</CommentEdited>}
                  // restrictedTo="Restricted to Admins Only"
                  time={<CommentTime>{comment?.created}</CommentTime>}
                  content={
                    displayContents(comment?.body?.content)
                  }
                  actions={[
                    <CommentAction onClick={() => handleReply(i)}>Reply</CommentAction>,
                    <CommentAction>Edit</CommentAction>,
                    <CommentAction>Like</CommentAction>,
                  ]}
                />
              </Row>
              {
                formVisibleIndex === i && 
                <Form onSubmit={(e) => onSubmit(e, i)}>
                  <Textfield
                    placeholder="Add a comment ..."
                    value={input}
                    onChange={({ target }) => setInput(target.value)}
                    key={`textfield-${i}`}
                    elemAfterInput = {
                      <Button 
                        appearance="subtle-link" 
                        onClick = {initFormVisbleIndex} 
                        iconBefore={<EditorCloseIcon/>}
                      />
                    }
                  />
                </Form>
              }
            </Fragment>
          );
        })}
      </ScrollContainer>
    </>
  );
}

export default App;
