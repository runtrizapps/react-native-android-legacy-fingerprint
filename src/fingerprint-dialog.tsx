import { createNanoEvents } from 'nanoevents';
import React, {
  ComponentType,
  createRef,
  FunctionComponent,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AppState,
  AppStateStatus,
  Image,
  ImageStyle,
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import Fingerprint, { FingerprintError } from '.';

type OpeningOptions = {
  title?: string;
  content?: string;
};

type LegacyFingerprintResult = { success: boolean };

type InternalRefParam = OpeningOptions & {
  visible: boolean;
  callback?: (result: LegacyFingerprintResult) => void;
};

const DialogRef = createRef() as MutableRefObject<((param: InternalRefParam) => void) | undefined>;

export async function showLegacyFingerprintDialog(
  opts?: OpeningOptions
): Promise<LegacyFingerprintResult> {
  if (typeof DialogRef.current === 'undefined') {
    throw new Error('LegacyFingerprintDialog must be mounted in your app');
  }
  const { current: refFn } = DialogRef;
  const promise = new Promise<LegacyFingerprintResult>((resolve) => {
    refFn({
      ...opts,
      visible: true,
      callback: resolve,
    });
  });
  return await promise;
}

export function cancelLegacyFingerprintDialog(): void {
  if (typeof DialogRef.current === 'undefined') {
    throw new Error('LegacyFingerprintDialog must be mounted in your app');
  }
  DialogRef.current({ visible: false });
}

type Props = {
  backgroundStyle?: StyleProp<ViewStyle>;
  modalStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  headerTextStyle?: StyleProp<TextStyle>;
  headerText?: string;
  contentStyle?: StyleProp<ViewStyle>;
  contentTextStyle?: StyleProp<TextStyle>;
  contentText?: string;
  iconContainerStyle?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  icon?: ComponentType;
  hintStyle?: StyleProp<TextStyle>;
  cancelButtonStyle?: StyleProp<ViewStyle>;
  cancelButtonTextStyle?: StyleProp<TextStyle>;
  terms?: {
    cancel?: string;
    hint?: string;
    success?: string;
    failure?: string;
  };
};

type Events = {
  complete: (result: LegacyFingerprintResult) => void;
};

const DEFAULT_TEXTS = {
  headerText: 'Fingerprint confirmation',
  contentText: 'Use your fingerprint scanner to verify your identity',
  cancel: 'Cancel',
  hint: 'Touch sensor',
  success: 'Fingerprint recognized',
  failure: 'Fingerprint not recognized. Try again.',
};

export const LegacyFingerprintDialog: FunctionComponent<Props> = (props) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState(props.headerText ?? DEFAULT_TEXTS.headerText);
  const [content, setContent] = useState(props.contentText ?? DEFAULT_TEXTS.contentText);
  const [hint, setHint] = useState(props.terms?.hint ?? DEFAULT_TEXTS.hint);
  const [appActive, setAppActive] = useState(true);
  const emitter = useRef(createNanoEvents<Events>()).current;

  const handlePressCancel = useCallback(() => {
    setVisible(false);
    emitter.emit('complete', { success: false });
  }, [emitter]);

  // Set up external function ref
  useEffect(() => {
    DialogRef.current = (param: InternalRefParam) => {
      if (typeof param.title !== 'undefined') {
        setTitle(param.title);
      }
      if (typeof param.content !== 'undefined') {
        setContent(param.content);
      }

      if (param.visible) {
        setVisible(param.visible);
        if (typeof param.callback === 'function') {
          const { callback } = param;
          const unbind = emitter.on('complete', (result) => {
            callback(result);
            unbind();
          });
        }
      } else {
        handlePressCancel();
      }
    };
  }, [handlePressCancel, emitter]);

  // Set content text on warning
  useEffect(() => {
    const handleWarning = (err: FingerprintError) => {
      setHint(err.message);
    };
    const handleAppStateChange = (status: AppStateStatus) => {
      setAppActive(status === 'active');
    };
    AppState.addEventListener('change', handleAppStateChange);
    const removeWarningListener = Fingerprint.addWarningListener(handleWarning);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
      removeWarningListener();
    };
  }, []);

  // Reset title/content text and cancel auth on hide
  const firstRender = useRef(true);
  useEffect(() => {
    if (!firstRender.current && !visible) {
      setTitle(props.headerText ?? DEFAULT_TEXTS.headerText);
      setContent(props.contentText ?? DEFAULT_TEXTS.contentText);
      setHint(props.terms?.hint ?? DEFAULT_TEXTS.hint);
      void Fingerprint.isAuthenticationCanceled().then((isCanceled) => {
        if (!isCanceled) {
          void Fingerprint.cancelAuthentication();
        }
      });
    }
    firstRender.current = false;
  }, [visible, props.headerText, props.contentText, props.terms?.hint]);

  // Authenticate on show, cancel on app pause
  const performAuth = useCallback(() => {
    void Fingerprint.authenticate()
      .then((success) => {
        if (success) {
          setHint(props.terms?.success ?? DEFAULT_TEXTS.success);
          emitter.emit('complete', { success: true });
          setTimeout(() => setVisible(false), 500);
        } else {
          setHint(props.terms?.failure ?? DEFAULT_TEXTS.failure);
          void Fingerprint.cancelAuthentication().then(() => {
            setTimeout(performAuth, 250);
          });
        }
      })
      .catch((e: Error & { code?: string }) => {
        if (e?.code !== Fingerprint.Constants.FINGERPRINT_ERROR_CANCELED) {
          throw e;
        }
      });
  }, [props.terms?.success, props.terms?.failure, emitter]);
  useEffect(() => {
    if (visible) {
      if (appActive) {
        performAuth();
      } else {
        void Fingerprint.cancelAuthentication();
      }
    }
  }, [visible, appActive, performAuth]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handlePressCancel}>
      <View style={[styles.background, props.backgroundStyle]}>
        <View style={[styles.modal, props.modalStyle]}>
          <View style={[styles.header, props.headerStyle]}>
            <Text style={[styles.headerText, props.headerTextStyle]}>{title}</Text>
          </View>
          <View style={[styles.content, props.contentStyle]}>
            <View style={[styles.iconContainer, props.iconContainerStyle]}>
              {typeof props.icon !== 'undefined' ? (
                <props.icon />
              ) : (
                <Image style={[styles.icon, props.iconStyle]} source={require('./icon.png')} />
              )}
              <Text style={[styles.hint, props.hintStyle]}>{hint}</Text>
            </View>
            <Text style={[styles.contentText, props.contentTextStyle]}>{content}</Text>
            <TouchableOpacity
              onPress={handlePressCancel}
              style={[styles.cancelButton, props.cancelButtonStyle]}
            >
              <Text style={[styles.cancelButtonText, props.cancelButtonTextStyle]}>
                {props.terms?.cancel ?? DEFAULT_TEXTS.cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modal: {
    width: 250,
    backgroundColor: 'white',
  },
  header: {
    padding: 12,
    justifyContent: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 8,
    paddingTop: 35,
    paddingBottom: 16,
    height: 250,
    justifyContent: 'space-between',
  },
  hint: { flex: 1, textAlign: 'center' },
  contentText: { textAlign: 'center', paddingHorizontal: 15 },
  icon: { width: 60, height: 60, marginLeft: 12, resizeMode: 'contain' },
  iconContainer: { alignItems: 'center', flexDirection: 'row', width: '100%' },
  cancelButton: { backgroundColor: '#ccc' },
  cancelButtonText: { textAlign: 'center', padding: 12 },
});
