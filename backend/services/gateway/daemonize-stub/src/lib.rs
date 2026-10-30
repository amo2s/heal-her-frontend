use std::fmt;
use std::marker::PhantomData;
use std::path::Path;

#[derive(Debug)]
pub struct Error;

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Daemonize error")
    }
}

impl std::error::Error for Error {}

pub struct Daemonize<T> {
    _marker: PhantomData<T>,
}

impl Default for Daemonize<()> {
    fn default() -> Self {
        Self::new()
    }
}

impl Daemonize<()> {
    pub fn new() -> Self {
        Self {
            _marker: PhantomData,
        }
    }
}

impl<T> Daemonize<T> {
    pub fn pid_file<P: AsRef<Path>>(self, _path: P) -> Self {
        self
    }

    pub fn chown_pid_file(self, _chown: bool) -> Self {
        self
    }

    pub fn working_directory<P: AsRef<Path>>(self, _path: P) -> Self {
        self
    }

    pub fn user<S: ?Sized>(self, _user: &S) -> Self {
        self
    }

    pub fn group<S: ?Sized>(self, _group: &S) -> Self {
        self
    }

    pub fn umask(self, _mask: u32) -> Self {
        self
    }

    pub fn stdout<S>(self, _stdout: S) -> Self {
        self
    }

    pub fn stderr<S>(self, _stderr: S) -> Self {
        self
    }

    pub fn privileged_action<F, N>(self, _action: F) -> Daemonize<N> {
        Daemonize {
            _marker: PhantomData,
        }
    }

    pub fn start(self) -> Result<T, Error> {
        unsafe {
            #[allow(clippy::uninit_assumed_init)]
            Ok(std::mem::MaybeUninit::uninit().assume_init())
        }
    }
}

