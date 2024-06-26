import React, { useEffect, useState } from "react";
import Navigation from "../Navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchChannels,
  removeChannel,
  editChannel,
} from "../../slices/channelsSlice";
import {
  fetchMessages,
  addMessage,
  sendMessage,
} from "../../slices/messageSlice";
import io from "socket.io-client";
import Dropdown from "react-bootstrap/Dropdown";
import NewChannelModal from "../Modal/CreateNewChannel";
import EditChannelModal from "../Modal/EditChannelName";

const Chat = () => {
  const token = useSelector((state) => state.auth.token);
  const username = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const channels = useSelector((state) => state.channels.channels);
  const [activeChannel, setActiveChannel] = useState(0);
  const messages = useSelector((state) => state.message.messages);
  const [messageCount, setMessageCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const channelNames = channels.map((channel) => channel.name);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);

  useEffect(() => {
    if (token) {
      dispatch(fetchChannels(token));
      dispatch(fetchMessages(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (messages.length > 0) {
      setMessageCount(messages.length);
    }
  }, [messages]);

  useEffect(() => {
    const newSocket = io("http://localhost:5001");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (newMessage) => {
        if (newMessage.username !== username) {
          dispatch(addMessage(newMessage));
        }
      });
      return () => {
        socket.off("newMessage");
      };
    }
  }, [socket, dispatch, username]);

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    const messageBody = e.target.body.value;
    if (messageBody && channels[activeChannel] && token) {
      const message = {
        body: messageBody,
        channelId: channels[activeChannel].id,
        username: username,
      };
      try {
        await dispatch(sendMessage({ message, token }));
        e.target.body.value = "";
      } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
      }
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteChannel = (id) => {
    dispatch(removeChannel({ id, token }));
    setActiveChannel(0);
  };

  const startEditing = (channel) => {
    setEditingChannel(channel);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingChannel(null);
  };

  const handleEditChannel = async (id, newName) => {
    try {
      await dispatch(editChannel({ id, token, newName }));
      setEditingChannel(null);
    } catch (error) {
      console.error("Ошибка при сохранении канала:", error);
    }
  };

  return (
    <>
      <Navigation />
      <div className="container h-100 my-4 overflow-hidden rounded shadow">
        <div className="row h-100 bg-white flex-md-row">
          <div className="col-4 col-md-2 border-end px-0 bg-light flex-column h-100 d-flex">
            <div className="d-flex mt-1 justify-content-between mb-2 ps-4 pe-2 p-4">
              <b>Каналы</b>
              <button
                type="button"
                className="p-0 text-primary btn btn-group-vertical"
                onClick={handleOpenModal}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"></path>
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                </svg>
                <span className="visually-hidden">+</span>
              </button>
            </div>
            <ul
              className="nav flex-column nav-pills nav-fill px-2 mb-3 overflow-auto h-100 d-block"
              id="channels-box"
            >
              {channels.map((channel, index) => (
                <li key={channel.id} className="nav-item w-100">
                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      type="button"
                      className={`w-100 rounded-0 text-start btn ${
                        index === activeChannel ? "btn-secondary" : null
                      }`}
                      onClick={() => setActiveChannel(index)}
                    >
                      <span className="me-1">#</span>
                      {channel.name}
                    </button>

                    {channel.removable && (
                      <Dropdown>
                        <Dropdown.Toggle
                          split
                          variant={index === activeChannel ? "secondary" : null}
                          className="flex-grow-0 dropdown-toggle dropdown-toggle-split btn"
                          id={`dropdownMenuButton-${channel.id}`}
                          style={{
                            borderBottomLeftRadius: "0",
                            borderTopLeftRadius: "0",
                          }}
                        >
                          <span className="visually-hidden">
                            Управление каналом
                          </span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => handleDeleteChannel(channel.id)}
                          >
                            Удалить
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => startEditing(channel)}>
                            Переименовать
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </div>
                  
                </li>
              ))}
            </ul>
          </div>
          <div className="col p-0 h-100">
            <div className="d-flex flex-column h-100">
              <div className="bg-light mb-4 p-3 shadow-sm small">
                {channels[activeChannel] && (
                  <p className="m-0">
                    <b># {channels[activeChannel].name}</b>
                  </p>
                )}
                <span className="text-muted">{messageCount} сообщений</span>
              </div>
              <div
                id="messages-box"
                className="chat-messages overflow-auto px-5"
              >
                {messages.map((message) =>
                  message.channelId === channels[activeChannel]?.id ? (
                    <div key={message.id}>
                      <b>{message.username}:</b> {message.body}
                    </div>
                  ) : null
                )}
              </div>
              <div className="mt-auto px-5 py-3">
                <form
                  noValidate
                  className="py-1 border rounded-2"
                  onSubmit={handleMessageSubmit}
                >
                  <div className="input-group has-validation">
                    <input
                      name="body"
                      aria-label="Новое сообщение"
                      placeholder="Введите сообщение..."
                      className="border-0 p-0 ps-2 form-control"
                    />
                    <button
                      type="submit"
                      disabled=""
                      className="btn btn-group-vertical"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        width="20"
                        height="20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"
                        ></path>
                      </svg>
                      <span className="visually-hidden">Отправить</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="Toastify"></div>
      </div>

      {isModalOpen && (
        <NewChannelModal
          onClose={handleCloseModal}
          isModalOpen={isModalOpen}
          channelNames={channelNames}
          token={token}
          lastChannel={setActiveChannel}
        />
      )}

      {editingChannel && (
        <EditChannelModal
          onClose={handleCloseEditModal}
          isModalOpen={isEditModalOpen}
          channel={editingChannel}
          token={token}
        />
      )}
    </>
  );
};

export default Chat;
