import {useCallback, useEffect, useRef, useState} from 'preact/hooks';

import {clickInsideElement} from '/src/Common';
import {FileDrop} from '/src/FileDrop';
import {AbilityLibraryDialog} from './AbilityLibraryDialog';
import {IconDialog} from './IconDialog';
import {PortraitDialog} from './PortraitDialog';
import './ImageModal.css';

const ImageModal = ({image, onClose, onChange, type}) => {
  const ref = useRef();
  const onClick = useCallback((ev) => {
    ev.stopPropagation();
    if (ref.current && !clickInsideElement(ref.current, ev)) {
      onClose();
    }
  }, [ref, onClose]);

  useEffect(() => {
    const {current} = ref;
    if (current) {
      current.showModal();
      return () => current.close();
    }
  }, [ref]);

  const contents = type === 'ability-library' ?
    <AbilityLibraryDialog image={image} onChange={onChange} onClose={onClose} /> :
    type === 'icon' ?
    <IconDialog image={image} onChange={onChange} onClose={onClose} /> :
    <PortraitDialog image={image} onChange={onChange} onClose={onClose} type={type} />;

  return (
    <dialog ref={ref} className="mock-image-dialog" onCancel={onClose} onClick={onClick}>
      {contents}
    </dialog>
  );
};

const ImageModalTrigger = ({children, image, onChange, type, modalType, dropType}) => {
  const [show, setShow] = useState(false);
  const onOpen = useCallback(() => setShow(true), [setShow]);
  const onClose = useCallback(() => setShow(false), [setShow]);
  const onChangeWrapped = useCallback((data) => {
    setShow(false);
    onChange(data);
  }, [setShow, onChange]);
  const resolvedModalType = modalType || type;
  const resolvedDropType = dropType || type;

  return (
    <div className="mock-image-modal-trigger" onClick={onOpen}>
      <div className="mock-image-modal-overlay" />
      {show && <ImageModal image={image} type={resolvedModalType} onChange={onChangeWrapped} onClose={onClose} />}
      <FileDrop type={resolvedDropType} onDrop={onChange}>
        {children}
      </FileDrop>
    </div>
  );
};

export {ImageModal, ImageModalTrigger};
